<?php
/**
 * Thumbnail Helper (_thumbs.php)
 * -----------------------------------------------------------------------
 * Generates and caches down-scaled WebP thumbnails for uploaded poster
 * images (Menús, Avisos, Eventos, ...). Grids render the small variant and
 * the lightbox renders the medium variant as an instant placeholder while
 * the full-resolution file streams in, which cuts first-paint bytes on
 * poster-heavy pages by roughly an order of magnitude.
 *
 * On-disk layout (sibling folder of the originals so the same public URL
 * prefix serves it, no extra rewrite rules needed):
 *
 *   /api/uploads/{domain}/{section}/_thumbs/{stem}-w{width}.webp
 *
 * Thumbnails are derived data: they can be deleted at any time and will be
 * regenerated on the next upload or listing. Requires GD (enabled on IONOS);
 * when GD is missing every function degrades to `null` and callers simply
 * fall back to the original image.
 */

/** Widths (px) generated for every uploaded image. */
const THUMB_WIDTHS = [
    'small'  => 480,   // grid cards
    'medium' => 1000,  // lightbox placeholder / small screens
];

/** WebP quality used for thumbnails (lower than originals — they're small). */
const THUMB_QUALITY = 72;

/** Folder name (inside each section dir) holding the generated thumbnails. */
const THUMB_DIR_NAME = '_thumbs';

/**
 * True when this PHP build can encode WebP thumbnails.
 */
function thumbs_supported() {
    return function_exists('imagewebp')
        && function_exists('imagecreatefromstring')
        && function_exists('imagecreatetruecolor');
}

/**
 * Absolute path of the thumbnail cache folder for a section dir.
 * Creates the folder on first use.
 *
 * @param string $sectionDir Absolute section directory (no trailing slash)
 * @return string
 */
function thumb_dir($sectionDir) {
    $dir = $sectionDir . '/' . THUMB_DIR_NAME;
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }
    return $dir;
}

/**
 * Cache filename for a given original filename + target width.
 * Example: ("01-menu.webp", 480) → "01-menu-w480.webp"
 */
function thumb_filename($filename, $width) {
    $stem = preg_replace('/\.[^.]+$/', '', $filename);
    return $stem . '-w' . (int)$width . '.webp';
}

/**
 * Generate (or refresh) one thumbnail for an original image.
 * -----------------------------------------------------------------------
 * Skips work when a cached thumbnail already exists and is newer than the
 * original. Images already narrower than the target width are not upscaled;
 * they are re-encoded to WebP at the source size so the cache is uniform.
 *
 * @param string $srcPath    Absolute path of the original image
 * @param string $sectionDir Absolute section directory
 * @param int    $width      Target width in px
 * @return string|null       Thumbnail filename, or null when unavailable
 */
function generate_thumbnail($srcPath, $sectionDir, $width) {
    if (!thumbs_supported() || !is_file($srcPath)) return null;

    $ext = strtolower(pathinfo($srcPath, PATHINFO_EXTENSION));
    if (!in_array($ext, ['webp', 'jpg', 'jpeg', 'png', 'gif'], true)) return null;

    $name     = basename($srcPath);
    $outName  = thumb_filename($name, $width);
    $outPath  = thumb_dir($sectionDir) . '/' . $outName;

    // Cache hit: thumbnail exists and is not older than the original.
    if (is_file($outPath) && @filemtime($outPath) >= (@filemtime($srcPath) ?: 0)) {
        return $outName;
    }

    $raw = @file_get_contents($srcPath);
    if ($raw === false) return null;
    $src = @imagecreatefromstring($raw);
    if ($src === false) return null;

    $srcW = imagesx($src);
    $srcH = imagesy($src);
    if ($srcW < 1 || $srcH < 1) { @imagedestroy($src); return null; }

    // Never upscale — clamp the target to the source width.
    $dstW = min((int)$width, $srcW);
    $dstH = max(1, (int)round($srcH * ($dstW / $srcW)));

    $dst = @imagecreatetruecolor($dstW, $dstH);
    if ($dst === false) { @imagedestroy($src); return null; }

    // Preserve transparency for PNG/GIF/WebP sources.
    @imagealphablending($dst, false);
    @imagesavealpha($dst, true);
    $transparent = @imagecolorallocatealpha($dst, 0, 0, 0, 127);
    @imagefilledrectangle($dst, 0, 0, $dstW, $dstH, $transparent);
    @imagepalettetotruecolor($src);

    $ok = @imagecopyresampled($dst, $src, 0, 0, 0, 0, $dstW, $dstH, $srcW, $srcH);
    @imagedestroy($src);
    if (!$ok) { @imagedestroy($dst); return null; }

    // Encode to a temp file first so a failed write never leaves a corrupt
    // thumbnail in the cache (which would then be served to visitors).
    $tmp = $outPath . '.tmp';
    $written = @imagewebp($dst, $tmp, THUMB_QUALITY);
    @imagedestroy($dst);
    if (!$written || !is_file($tmp)) { @unlink($tmp); return null; }
    if (!@rename($tmp, $outPath)) { @unlink($tmp); return null; }
    @chmod($outPath, 0664);

    return $outName;
}

/**
 * Generate every configured thumbnail size for one original image.
 *
 * @return array<string,string> Map of size key → thumbnail filename
 *                              (missing keys mean generation failed)
 */
function generate_all_thumbnails($srcPath, $sectionDir) {
    $out = [];
    foreach (THUMB_WIDTHS as $key => $width) {
        $name = generate_thumbnail($srcPath, $sectionDir, $width);
        if ($name !== null) $out[$key] = $name;
    }
    return $out;
}

/**
 * Delete all cached thumbnails belonging to one original filename.
 * Called when an admin deletes or replaces an upload.
 */
function delete_thumbnails($filename, $sectionDir) {
    $dir = $sectionDir . '/' . THUMB_DIR_NAME;
    if (!is_dir($dir)) return;
    foreach (THUMB_WIDTHS as $width) {
        $path = $dir . '/' . thumb_filename($filename, $width);
        if (is_file($path)) @unlink($path);
    }
}

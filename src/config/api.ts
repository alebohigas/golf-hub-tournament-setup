/**
 * API Configuration
 * Global configuration for webservice endpoints
 * Update PLAYERS_API_URL with the actual webservice URL when available
 */

// ============= API URL Configuration =============
// Change this URL to point to your webservice endpoint
export const PLAYERS_API_URL = 'https://api.example.com/players';

/**
 * Expected JSON response format from the webservice:
 * {
 *   "players": [
 *     {
 *       "id": "1",
 *       "clubLogo": "https://example.com/logo.png",  // URL of the club logo image
 *       "name": "Juan García López",                  // Player name
 *       "handicapIndex": 1.2,                         // HI value
 *       "handicapJuego": 1,                           // HJ value
 *       "handicapNeto": 0,                            // HN value
 *       "categoryId": "1"                             // Category ID
 *     }
 *   ]
 * }
 */

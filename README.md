# Torneos de Golf — plataforma multi-torneo

App React (Vite + TypeScript + Tailwind) con backend PHP/MySQL en `server/api/`.
Un mismo código base sirve a varios clubes: cada instalación tiene su propia base
de datos y elige qué **módulos** usa.

## Documentación

| Documento | Contenido |
|---|---|
| [docs/MODULES.md](docs/MODULES.md) | Arquitectura modular: catálogo, estado en ejecución, `/setup`, cómo agregar un módulo, poda. |
| [docs/NEW-PROJECT.md](docs/NEW-PROJECT.md) | Cómo arrancar un proyecto nuevo para otro club. |
| [server/api/README.md](server/api/README.md) | Endpoints PHP disponibles y vistas/funciones MySQL requeridas. |

## Módulos, en corto

- `src/modules/registry.ts` — catálogo único de módulos (fuente de verdad).
- `/setup` — página exclusiva del superadmin para encender/apagar módulos.
- `site_config.modules_config` — dónde se guarda la selección (por dominio).
- `bun scripts/prune-modules.ts --list` — borrar el código de los módulos que no se usen.

Apagar un módulo oculta su página, su ruta y su tab de `/admin`, y **gana** sobre
la visibilidad configurada en `/admin → Página`. Solo el superadmin puede reactivarlo.

## Project info

## Commit convention

feat: new feature  
fix: bug fix  
refactor: internal changes  
style: UI changes  
chore: config / tooling  
docs: documentation  

Format:
<type>: <description> (#issue_number)

## Project AI support 

**URL**: https://lovable.dev/projects/57557205-529e-486b-993f-0a145a3ac5c2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/57557205-529e-486b-993f-0a145a3ac5c2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)


**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS



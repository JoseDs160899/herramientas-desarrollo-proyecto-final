# CI/CD y Cloud — RegistraU (APF3)

Documentación técnica del entorno de prueba en nube, preparación del servidor y flujo de Integración Continua / Entrega Continua.

## 1. Resumen del entorno cloud

| Dato | Valor |
|------|--------|
| Proveedor / VM | Servidor Debian 13 (cloud) |
| IP pública | `167.148.33.105` |
| SO | Debian GNU/Linux 13 (trixie) |
| Usuario de despliegue | `deploy` |
| Carpeta de aplicaciones | `/home/deploy/apps` |
| Puerto de la app | `3000` |
| URL prevista | `http://167.148.33.105:3000` |
| Node.js | `v22.23.5` |
| npm | `10.9.9` |
| PM2 | `7.1.2` |

## 2. Acceso SSH (sin `~/.ssh/config`)

Conexión directa con clave:

```bash
ssh -i ~/.ssh/id_rsa deploy@167.148.33.105
```

También funciona el acceso `root` (administración). El usuario `deploy` tiene:

- Autenticación por clave SSH (`authorized_keys`).
- Contraseña local para consola / recuperación.
- Permisos `sudo` sin contraseña (necesario para CD / reinicios de servicio).

## 3. Preparación del servidor (realizada)

### 3.1. Usuario y SSH

1. Se creó el usuario `deploy`.
2. Se instaló la clave pública en `/home/deploy/.ssh/authorized_keys`.
3. Se creó `/home/deploy/apps` como destino de despliegues.
4. Se verificó login: `ssh -i ~/.ssh/id_rsa deploy@167.148.33.105`.

### 3.2. Node.js y PM2

```bash
# Verificado en el servidor
node -v   # v22.23.5
npm -v    # 10.9.9
pm2 -v    # 7.1.2
pm2 ping  # { msg: 'pong' }
```

- Node.js 22 instalado desde NodeSource (compatible con `engines.node >= 22.5.0` del proyecto).
- PM2 instalado globalmente.
- Servicio systemd `pm2-deploy.service` habilitado para arranque automático.

### 3.3. Firewall (UFW)

| Regla | Puerto | Uso |
|-------|--------|-----|
| OpenSSH | 22 | Administración y CD por SSH |
| App RegistraU | 3000/tcp | Acceso HTTP de prueba |

```bash
sudo ufw status
# OpenSSH ALLOW
# 3000/tcp ALLOW
```

## 4. Integración Continua (CI) — requisito APF3 §7

Herramienta: **GitHub Actions**.

Validaciones previstas en el workflow:

1. Checkout del repositorio.
2. Configuración de Node.js 22.
3. `npm ci` / `npm install`.
4. Verificación de estructura (archivos requeridos).
5. `npm test` (pruebas automatizadas existentes).
6. Resultado exitoso o fallo visible en Actions.

Disparadores: `push` y `pull_request` sobre la rama principal (y ramas de feature según se configure).

Archivo: `.github/workflows/ci.yml`.

## 5. Entrega Continua (CD) — requisito APF3 §8

Flujo objetivo:

1. Desarrollar y guardar cambios con Git.
2. Push al repositorio remoto.
3. Ejecutar y verificar CI.
4. Publicación automática/semiautomática por SSH hacia el servidor.
5. Verificar estado del despliegue (`pm2 status`, healthcheck).
6. Comprobar versión publicada en la URL cloud.

Despliegue típico en el servidor:

```bash
cd /home/deploy/apps/herramientas-desarrollo-proyecto-final
git pull
npm ci
pm2 restart registrau || pm2 start src/server.js --name registrau -- --HOST=0.0.0.0 --PORT=3000
pm2 save
curl -s http://127.0.0.1:3000/api/health
```

> Nota: el servidor escucha por defecto en `127.0.0.1`. Para acceso público se debe iniciar con `HOST=0.0.0.0`.

Secretos configurados en GitHub (Settings → Secrets and variables → Actions):

| Secreto | Descripción |
|---------|-------------|
| `SSH_HOST` | `167.148.33.105` |
| `SSH_USER` | `deploy` |
| `SSH_PRIVATE_KEY` | Clave privada `registrau_gha_deploy` (solo para Actions) |
| `SSH_PORT` | `22` |

Archivo CD: `.github/workflows/cd.yml` (usa `appleboy/ssh-action` + PM2 con `ecosystem.config.cjs`).

## 6. Evidencias para el informe

| Evidencia | Ubicación sugerida |
|-----------|--------------------|
| Servidor con Node/PM2 | `evidencias/apf3-01-node-pm2.png` |
| Acceso SSH usuario deploy | `evidencias/apf3-02-ssh-deploy.png` |
| Firewall / puertos | `evidencias/apf3-03-ufw.png` |
| Archivo workflow CI | (tras crear `.github/workflows/ci.yml`) |
| Pipeline CI exitoso | captura de GitHub Actions |
| CD / deployment | captura de Actions + `pm2 status` |
| App en cloud | captura del navegador en la URL |

## 7. Comandos útiles en el servidor

```bash
# Estado
pm2 status
pm2 logs registrau --lines 50

# Reinicio
pm2 restart registrau

# Health local
curl -s http://127.0.0.1:3000/api/health

# Firewall
sudo ufw status numbered
```

## 8. Estado actual (checklist APF3 CI/CD / Cloud)

| Requisito | Estado |
|-----------|--------|
| Servidor cloud disponible | Listo |
| Usuario `deploy` + SSH | Listo |
| Node.js 22 + npm | Listo |
| PM2 + arranque al reiniciar | Listo |
| Puerto 3000 abierto | Listo |
| Workflow CI GitHub Actions | Listo (`.github/workflows/ci.yml`) |
| Workflow CD / publicación | Listo (`.github/workflows/cd.yml`) |
| Secretos GitHub (`SSH_*`) | Listo |
| App desplegada y URL verificada | Tras el primer push a `main` |
| README actualizado con CI/CD/URL | Listo |

## 9. Relación con el informe APF3

- **§7 Integración continua:** GitHub Actions ejecutará `npm test` y validaciones de estructura.
- **§8 Entrega continua:** despliegue por SSH al VPS con PM2.
- **§9 Cloud:** primera ejecución accesible por Internet en `http://167.148.33.105:3000`.

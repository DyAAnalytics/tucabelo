/**
 * Vercel Serverless Function — Tucabelo Admin API
 * 
 * Variables de entorno requeridas en Vercel:
 *   GITHUB_TOKEN         → Personal Access Token con permiso "repo"
 *   ADMIN_PASSWORD_HASH  → SHA-256 hex de la contraseña del admin
 */

const crypto = require('crypto');

const OWNER     = 'DyAAnalytics';
const REPO      = 'tucabelo';
const FILE_PATH = 'data/products.json';
const BRANCH    = 'main';

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { action, passwordHash, products } = req.body || {};

  // ── Verificar contraseña ──────────────────────────────────────────
  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!storedHash) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD_HASH no configurado en Vercel.' });
  }
  if (!passwordHash || passwordHash !== storedHash) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' });
  }

  // ── Acción: verificar (solo login) ───────────────────────────────
  if (action === 'verify') {
    return res.status(200).json({ ok: true });
  }

  // ── Acción: cargar productos desde GitHub ────────────────────────
  if (action === 'load') {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'GITHUB_TOKEN no configurado en Vercel.' });
    }
    try {
      const getRes = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
        { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
      );
      if (!getRes.ok) throw new Error('No se pudo leer el archivo del repositorio.');
      const fileData = await getRes.json();
      const products = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
      
      return res.status(200).json({ ok: true, products, sha: fileData.sha });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── Acción: guardar productos ────────────────────────────────────
  if (action === 'save') {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'GITHUB_TOKEN no configurado en Vercel.' });
    }

    try {
      // Obtener SHA actual del archivo si no se proporcionó
      let currentSha = req.body.sha;
      if (!currentSha) {
        const getRes = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
          { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
        );
        if (!getRes.ok) throw new Error('No se pudo leer el archivo del repositorio para actualizar.');
        const fileData = await getRes.json();
        currentSha = fileData.sha;
      }

      // Actualizar archivo
      const content = Buffer.from(JSON.stringify(products, null, 4), 'utf-8').toString('base64');
      const putRes = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: req.body.message || 'admin: actualización de productos',
            content,
            sha: currentSha,
            branch: BRANCH
          })
        }
      );

      if (!putRes.ok) {
        const err = await putRes.json();
        throw new Error(err.message || 'Error al guardar en GitHub.');
      }

      const result = await putRes.json();
      return res.status(200).json({ ok: true, newSha: result.content.sha });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'Acción no válida.' });
};

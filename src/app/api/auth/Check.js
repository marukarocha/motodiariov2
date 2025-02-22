import { auth } from '../../../lib/db/firebaseServices';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end(); // Method Not Allowed
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Hardcoded admin check (replace with your logic)
    const isAdmin = uid === '8Os7jlITY1akOK3dV16LKE3hYUD2';

    res.status(200).json({ isAdmin });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

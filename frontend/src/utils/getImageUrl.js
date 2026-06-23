import { API_BASE } from '../api';

export function getImageUrl(path) {
  if (!path) return '/assets/avatars/default-avatar.png';
  return path.startsWith('http')
    ? path
    : `${API_BASE}${path}`;
}

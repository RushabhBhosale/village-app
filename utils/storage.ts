import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Upload an image from a local URI to Firebase Storage, return the download URL
export async function uploadImage(uid: string, type: 'provider', uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const storageRef = ref(storage, `${type}/${uid}/profile.${ext}`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

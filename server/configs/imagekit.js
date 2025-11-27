import ImageKit from '@imagekit/nodejs';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',   // safe to include on server only
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '', // NEVER expose to client
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_endpoint'
});
export default imagekit;
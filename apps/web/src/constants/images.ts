export const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="12" fill="#999"
        text-anchor="middle" dominant-baseline="middle">No image</text>
    </svg>`
  );

export const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.target as HTMLImageElement;
  if (target.src !== FALLBACK_IMG) target.src = FALLBACK_IMG;
};

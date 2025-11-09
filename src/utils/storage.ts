export const getStorageItem = async <TValue>(key: string) => {
  const value = await figma.clientStorage.getAsync(key)
  return (value ?? null) as TValue | null
}

export const setStorageItem = async <TValue>(key: string, value: TValue) => {
  await figma.clientStorage.setAsync(key, value)
}

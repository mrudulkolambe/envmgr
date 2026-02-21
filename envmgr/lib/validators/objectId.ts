export const isObjectId = (id: string) =>
  /^[a-f\d]{24}$/i.test(id)
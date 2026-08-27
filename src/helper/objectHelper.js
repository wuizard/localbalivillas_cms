function getValuefromArrayObject(
    arrayObject,
    value
) {
   let newValue = null
   for (let i = 0; i < arrayObject.length; i ++) {
    if (value === arrayObject[i].value) { newValue = arrayObject[i]; break; }
   }
   return newValue
}

export { getValuefromArrayObject }
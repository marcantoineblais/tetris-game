
//Input string, output string with 1st letter capitalized and other letters downcased
export const capitalize = (string) => {
  return string.split("").map((l, i) => i === 0 ? l.toUpperCase() : l.toLowerCase()).join("")
}


//Input 1 array, output 1 array of uniq data
export const uniq = (array) => {
  const values = []
  array.forEach((el) => {
    if (!values.some((value) => el === value)) {
      values.push(el)
    }
  })
  return values
}

// Input string 
// Output string with 1st letter capitalized and other letters downcased
export const capitalize = (string = "") => {
  return string.split("").map((l, i) => i === 0 ? l.toUpperCase() : l.toLowerCase()).join("")
}

// Input 1 array
// Output 1 array of uniq data
export const uniq = (array = []) => {
  const values = []
  array.forEach((el) => {
    if (!values.some((value) => el === value)) {
      values.push(el)
    }
  })
  return values
}

//Input 1 array, input 1 arrow function that returns boolean
//Output 1 array with values that evaluate to true
export const select = (array = [], arrowFunc = (arg) => arg) => {
  const values = []
  array.forEach((el) => {
    if (arrowFunc(el)) {
      values.push(el)
    }
  })
  return values
}

//Input 1 array, input 1 arrow function that returns boolean
//Output 1 array without values that evaluate to false
export const reject = (array = [], arrowFunc = (arg) => arg) => {
  const values = []
  array.forEach((el) => {
    if (!arrowFunc(el)) {
      values.push(el)
    }
  })
  return values
}

// Input 1 array
// Output 1 object describing how many times a value appear in the initial awway
export const occurence = (array = []) => {
  const values = uniq(array)
  const obj = {}
  values.forEach((value) => {
    let n = 0
    array.forEach((el) => {
      if (el === value) {
        n += 1
      }
    })
    obj[value] = n
  })
  return obj
}
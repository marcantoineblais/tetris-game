
// capitalize(string)
// input no arguments
// output string with first character uppercased and other characters downcased
export const capitalize = (string) => {
  if (!typeof(string) === "string") {
    return string
  }
  return string.split("").map((l, i) => i === 0 ? l.toUpperCase() : l.toLowerCase()).join("")
}

// uniq(string || array || object)
// input string or array
// output an array with uniq elements (ignoring capitalization if string)
export const uniq = (arg) => {
  const values = []
  if (typeof(arg) === 'string') {
    arg = arg.toLowerCase().split("")
  }
  arg.forEach((el) => {
    if (!values.includes(el)) {
      values.push(el)
    }
  })
  return values
}


// occurence(string || array)
// input string or array
// output an object with uniq elements as keys and number of occurences as value (ignoring capitalization if string)
export const occurence = (arg) => {
  const obj = {}
  uniq(arg).forEach((el) => {
    let n = 0
    if (typeof(arg) === "string") {
      arg.split("").forEach((value) => {
        if (value === el) {
          n += 1
        }
      })
    } else {
      arg.forEach((value) => {
        if (value === el) {
          n += 1
        }
      })
    }
    obj[el] = n
  })
  return obj
}

// select(array || object, (element, index) => {} || (key, value, index) => {})
// input array or object and arrow function that returns a boolean
// output an array with the values that evaluate to true
export const select = (arg, arrowFunc = (el => el)) => {
  let values
  if (Array.isArray(arg)) {
    values = []
    arg.forEach((el, index) => {
      if (arrowFunc(el)) {
        values.push(el)
      }
    })
  } else if (typeof(arg) === 'object') {
    values = {}
    Object.entries(arg).forEach(([key, value], index) => {
      if (arrowFunc(key, value, index)) {
        values[key] = value
      }
    })
  }
  return values
}

// forEach(object, (key, value, index) => {})
// input object and arrow function that uses key, value, index as arguments and perform some actions
// output undefined
export const forEach = (arg, arrowFunc) => {
  Object.entries(arg).forEach(([key, value], index) => arrowFunc(key, value, index))
}

// map(object, (key, value, index) => {})
// input object and arrow function that uses key, value and index as arguments and returns any types of values
// output an array with all values returned from arrow function (return an array of [key, value] if no arguments are inputed)
export const map = (arg, arrowFunc = (key, value) => [key, value]) => {
  return Object.entries(arg).map(([key, value], index) => arrowFunc(key, value, index))
}

// split(object)
// input object
// output an array containing an array of keys and an array of values
export const split = (arg) => {
  const keys = []
  const values = []
  Object.entries(arg).forEach(([key, value]) => {
    keys.push(key)
    values.push(value)
  })
  return [keys, values]
}

// random(min, max)
// input 1 integer || 2 integers
// output 1 random integer between 0 and max value || min and max value
export const random = (min, max = null) => {
  if (!max) {
    max = min
    min = 0
  }
  return (Math.floor(Math.random() * (max - min))) + min
}


// wait(milliseconds)
// input 1 integer
// output 1 fulfilled promise after set amount of millisecond
export const wait = (time) => {
  return new Promise((r) => setTimeout(r, time))
}

// promise()
// input no argument
// output a new simple resolved promise
export const promise = (bool = true) => {
  if (bool) {
    return new Promise((f) => f)
  }

  return new Promise((_f, r) => r)
}
/* eslint-disable no-extend-native */

// STRING METHODS

// capitalize()
// input no arguments
// output string with first character uppercased and other characters downcased
Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.split("").map((l, i) => i === 0 ? l.toUpperCase() : l.toLowerCase()).join("")
  }
})

// uniq()
// input no arguments
// output an array with uniq characters ignoring capitalization
Object.defineProperty(String.prototype, "uniq", {
  value: function () {
    const chars = []
    this.toLowerCase().split("").forEach((el) => {
      if (!chars.some((char) => el.toLowerCase() === char.toLowerCase())) {
        chars.push(el.toLowerCase())
      }
    })
    return chars
  }
})

// occurence()
// input no arguments
// output an object with uniq characters as keys and number of occurences as keys (ignoring capitalization)
Object.defineProperty(String.prototype, "occurence", {
  value: function () {
    const obj = {}
    this.toLowerCase().uniq().forEach((char) => {
      let n = 0
      this.toLowerCase().split("").forEach((el) => {
        if (el === char) {
          n += 1
        }
      })
      obj[char] = n
    })
    return obj
  }
})

/* ________________________________________________________________________________________________ */

// ARRAY METHODS

// select(arg = arrowFunction)
// input arrow function as parameter that returns a boolean
// output an array with the values that evaluate to true
Object.defineProperty(Array.prototype, "select", {
  value: function (arrowFunc = (el => el)) {
    const values = []
    this.forEach((el) => {
      if (arrowFunc(el)) {
        values.push(el)
      }
    })
    return values
  }
})

// reject(arg = arrowFunction)
// input arrow function that returns a boolean as argument
// output an array without the values that evaluate to true
Object.defineProperty(Array.prototype, "reject", {
  value: function (arrowFunc = (arg) => arg) {
    const values = []
    this.forEach((el) => {
      if (!arrowFunc(el)) {
        values.push(el)
      }
    })
    return values
  }
})

// uniq()
// input no arguments
// output an array of unique values
Object.defineProperty(Array.prototype, "uniq", {
  value: function () {
    const values = []
    this.forEach((el) => {
      if (!values.some((value) => el === value)) {
        values.push(el)
      }
    })
    return values
  }
})

// occurence()
// input no arguments
// output an object with uniq values as keys and number of occurences has values
Object.defineProperty(Array.prototype, "occurence", {
  value: function () {
    const obj = {}
    this.uniq().forEach((value) => {
      let n = 0
      this.forEach((el) => {
        if (el === value) {
          n += 1
        }
      })
      obj[value] = n
    })
    return obj
  }
})


/* ________________________________________________________________________________________________ */

// OBJECT METHODS

// map(arg = arrowFunction)
// input arrow function that uses key, value and index as arguments and returns any types of values
// output an array with all values returned from arrow function (return an array of [key, value] if no arguments are inputed)
Object.defineProperty(Object.prototype, "map", {
  value: function (arrowFunc = (key, value) => [key, value]) {
    return Object.entries(this).map(([key, value], index) => arrowFunc(key, value, index))
  }
})


Object.defineProperty(Object.prototype, "forEach", {
  value: function (arrowFunc = () => null) {
    Object.entries(this).forEach(([key, value], index) => arrowFunc(key, value, index))
  }
})

// select(arg = arrowFunction)
// input arrow function that uses key, value and index as arguments and returns a boolean
// output an object with key: value pairs that evaluate to true 
Object.defineProperty(Object.prototype, "select", {
  value: function (arrowFunc = (key, value) => value) {
    const values = {}
    this.forEach((key, value, index) => {
      if (arrowFunc(key, value, index)) {
        values[key] = value
      }
    })
    return values
  }
})

// reject(arg = arrowFunction)
// input arrow function that uses key, value and index as arguments and returns a boolean
// output an object without the key: value pairs that evaluate to true
Object.defineProperty(Object.prototype, "reject", {
  value: function (arrowFunc = (_key, value) => value) {
    const values = {}
    this.forEach((key, value, index) => {
      if (!arrowFunc(key, value, index)) {
        values[key] = value
      }
    })
    return values
  }
})

// split()
// input no arguments
// output an array containing an array of keys and an array of values
Object.defineProperty(Object.prototype, "split", {
  value: function () {
    const keys = []
    const values = []
    this.forEach((key, value) => {
      keys.push(key)
      values.push(value)
    })
    return [keys, values]
  }
})
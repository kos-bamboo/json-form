const typeOf = x => Object.prototype.toString.call(x)
  .slice(8, -1)
  .toLowerCase()

export default typeOf

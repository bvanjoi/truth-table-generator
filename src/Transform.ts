/**
 * check a variable name is satisfy rules.
 * 
 * @param varName 
 * @returns {boolean}
 */
const satisfyVariable = (varName:string) => {
  // 第一个字符必须是字母或者下划线
  // 其余字符必须是字母、下划线、数字
  const pattern = /^[a-zA-Z_][a-zA-Z_\d]*/;
  return pattern.test(varName);
}

/**
 * According to the priority, construct the parentheses.
 * 
 * @param inputLine 
 * 
 * @example input: a || b -> c && d <-> (e -> !f)
 * @example output: (((a || b) -> (c && d)) <-> (e → !f))
 */
const constructParentheses = (inputLine:string) => {
  console.log(inputLine)
  let stack = [];
  const priority = ["~", "/\\", "^", "\\/", "->", "<->"];
  const pattern = /(!|&&|\^|\|\||->|<->|\(|\)| )/g
  // 首先将其转化为 PropVar
  const inputArr = inputLine.split(pattern)
  console.log(inputArr)
  console.log(inputArr.join(''))
}

const inputLine = "a /\\ b \\/ c -> d <-> e ^ f";
// const inputLine = "(test/\\fds<->afan ^ dcx\\/vd)/\\~saand ds->not(notaf<->ff or ad)->t/\\(not~af->asx~wetqs^a)->we/\\b\\/(and andcc/\\b)";
constructParentheses(inputLine);
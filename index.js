const priority = ["~", "/\\", "^", "\\/", "->", "<->"]; 

/**
 * tokenizer inputLine to .
 * 
 * @param { string } inputLine 
 * @returns { string[] }
 */
const tokenizer = (inputLine) => {
  const pattern = /(\s*~\s*|\s*\/\\\s*|\s*\^\s*|\s*\\\/\s*|\s*->\s*|\s*<->\s*|\s*\(\s*|\s*\)\s*| )/g
  // cut
  const inputArr = inputLine.split(pattern).filter(value=>value.length);
  return inputArr;
}

/**
 * check a variable name is satisfy rules.
 * 
 * @param {string} varName 
 * @returns {boolean}
 */
const satisfyVariable = (varName) => {
  function satisfyFirstChar(char) {
    return (char === '_')
        || (char >= 'a' && char <= 'z')
        || (char >= 'A' && char <= 'Z')
  }
  // 第一个字符必须是字母或者下划线
  // 其余字符必须是字母、下划线、数字
  for(let i = 0; i < varName.length; i++) {
    if( i === 0 && satisfyFirstChar(varName[i]) ) {
      ;
    } else if( i == 0) {
      return false;
    } else if (
      satisfyFirstChar(varName[i]) ||
      (varName[i] >= '0' && varName[i] <= '9')
    ){
      ;
    } else {
      return false;
    }
  }
  return varName.length > 0;
}

/**
 * transform infix-expression to post-expression
 * pay attention! the inputArr must be valid.
 *
 * @param {string[]} inputArr
 */
const inToPost = (inputArr) => {
  let recordStack = [];
  let result = [];

  function isSatisfyCondition(index) {
    return recordStack.length 
        && recordStack[recordStack.length - 1] !== '('
        && ( priority.indexOf(recordStack[recordStack.length - 1])) < index;
  }

  for( let it of inputArr) {
    const s = it.trim();
    if( s.length === 0) {
      ;
    } else if( s === '(') {
      recordStack.push( s);
    } else if( s === ')') {
      while( recordStack.length && recordStack[ recordStack.length - 1] !== '(') {
        result.push( recordStack.pop());
      }
      if( recordStack.length) { // 如果 recordStack 内部还有元素，则必然是 '('
        recordStack.pop();
      } else {
        result.push(')');
      }
    } else if( s === '~') {
      recordStack.push(s);
    } else if( s === '/\\') {
      while( isSatisfyCondition(2)) {
        result.push(recordStack.pop());
      }
      recordStack.push(s);
    } else if( s === '^') {
      while( isSatisfyCondition(3)){
        result.push(recordStack.pop());
      }
      recordStack.push(s);
    } else if( s === '\\/') {
      while(isSatisfyCondition(4)){
        result.push(recordStack.pop());
      }
      recordStack.push(s);
    } else if( s === '->') {
      while( isSatisfyCondition(5)){
        result.push(recordStack.pop());
      }
      recordStack.push(s);
    } else if( s === '<->') {
      while( isSatisfyCondition(6)){
        result.push(recordStack.pop());
      }
      recordStack.push(s);
    } else if( recordStack.length === 0) {
      recordStack.push(s);
    } else if( s) {
      result.push(s);
    }
  }
  while( recordStack.length) {
    result.push( recordStack.pop());
  }
  return result;
}

/**
 * check the correctness of inputLine 
 * 
 * rules:
 * var: satisfyVariable(var) === true && can't adjacent between more than one vars.
 * parentheses: left and right have same numbers && the sentence insides of paren is right.
 * conjunction: only ~ can adjacent, and others is not support.
 * 
 * @param { string[] } postExp
 * 
 * @returns { boolean }
 */
const check = (postExp) => {
  let checkStack = [];
  for( let it of postExp) {
    if( it === '(' || it === ')') {
      errorInfo.innerHTML = "<span>" + it + "</span> has no matching close parenthesis." 
      truthTable.innerHTML = "";
      return false;
    } else if( priority.indexOf( it) !== -1) {
      if( it === '~') {
        const temp = checkStack.pop();
        if( temp !== '~' 
          || !checkStack.length
          || !satisfyVariable(temp)) {
          errorInfo.innerHTML = "<span>" + it + "</span> missing an opearnd." 
        }
        checkStack.push(temp);
      } else {
        const temp2 = checkStack.pop();
        if( !checkStack.length) {
          errorInfo.innerHTML = "<span>" + it + "</span> missing an opearnd." 
          return false;
        }
        const temp1 = checkStack.pop();
        if( !satisfyVariable(temp2)) {
          errorInfo.innerHTML = "<span>" + temp2 + "</span> is not a valid variable." 
          truthTable.innerHTML = "";
          return false;
        } else if(!satisfyVariable(temp1)) {
          errorInfo.innerHTML = "<span>" + temp1 + "</span> is not a valid variable." 
          truthTable.innerHTML = "";
          return false;
        }
        checkStack.push(temp1);
      }
    } else {
      if( !satisfyVariable(it)){
        errorInfo.innerHTML = "<span>" + it + "</span> should not be here." 
        truthTable.innerHTML = "";
        return false;
      }
      checkStack.push(it);
    }
  }
  console.log('checkAfter: ', checkStack);
  if( (checkStack.length !== 1 && satisfyVariable(checkStack[checkStack.length - 1]))
    || (checkStack.length == 1 && !satisfyVariable(checkStack[checkStack.length - 1])) 
  ) {
    errorInfo.innerHTML = "<span>" + checkStack[checkStack.length - 1] + "</span> should not be here." 
    truthTable.innerHTML = "";
    return false;
  } 
  errorInfo.innerHTML = "";
  return true;
}

/**
 * transform post-exp to in-exp with parentheses.
 * And also, the inputArr is post-exp and it must be valid.
 * @param {string[]} postExp
 */
function postToInWithParentheses( postExp) {
  let recordStack = [];
  for( let it of postExp) {
    let s = it;
    if( s === 'T'){
      s = '⊤';
    } else if( s === 'F') {
      s = '⊥'
    }
    if( priority.indexOf( s) !== -1) {
      let conjunction;
      if( s === '~') {
        conjunction = "(~" + recordStack.pop() + ")";
      } else {
        const tempProp2 = recordStack.pop();
        const tempProp1 = recordStack.pop();
        conjunction = "(" + tempProp1 + " "+ s + " "+ tempProp2 + ")";
        }
      recordStack.push( conjunction);
    } else if( s !== '(' && s !== ')') {
      recordStack.push( s);
    }
  }
  return recordStack.pop(); // 此时，栈内部大小肯定为 1.
}

/**
 * enumerate all cases and calculate
 * 
 * @param { string[] } postExp 
 * @param { string } inExpWithParen
 */
const computeAll = (postExp, inExpWithParen) => {
  /**
   * remove duplicate
   */
  function removeDulicateVars() {
    return postExp.filter(value => value !== '(' && value !== ')' && priority.indexOf(value) === -1).filter((value, index, arr) => arr.indexOf(value, index + 1) === -1);
  }

  function extractTrueOrFalse() {
    return postExp.filter( value => value === 'T' || value === 'F');
  }

  /**
   * 
   * @param { object } valueCase 
   */
  function compute(valueCase) {
    /**
     * defined rules
     * 
     * @param { boolean } input1 
     * @param { boolean } input2 
     * @param { string } sign 
     */
    function rules(input1, input2 = false, sign) {
      switch(sign) {
        case "/\\":
          return input1 && input2;
        case "\\/":
          return input1 || input2;
        case "~":
          return !input1;
        case "^":
          return input1 !== input2;
        case "->": 
          return !input1 || input2;
        case "<->": 
          return input1 === input2;
      }
    }
    
    let recordPropStack = [];
    for( let it of postExp) {
      if( priority.indexOf( it) !== -1) {
        if( it === '~') {
          recordPropStack.push( rules(recordPropStack.pop(), false, it));
        } else {
          const temp1 = recordPropStack.pop();
          const temp2 = recordPropStack.pop();
          recordPropStack.push( rules(temp2, temp1, it));
        }
      } else if( it !== '(' && it !== ')') {
        if( it === 'T') {
          recordPropStack.push( true);
        } else if( it === 'F'){
          recordPropStack.push( false);
        } else {
          recordPropStack.push( valueCase[it]);
        }
      }
    }
    return recordPropStack.pop(); // 此时，栈内部大小肯定为 1.
  }

  /**
   * create td
   * 
   * @param {object} valueCase 
   * @param {boolean} result 
   */
  function createTableTd(valueCase, result) {
    let tr = document.createElement('tr');
    for( let it in valueCase) {
      let td = document.createElement('td');
      const s = valueCase[it] === true ? 'T' : 'F'; 
      td.innerHTML = "<span>" + s + "</span>";
      tr.appendChild(td);
    }
    let td = document.createElement('td');
    td.innerHTML = "<span style='font-weight:600;'>" + result +  "</span>";
    tr.appendChild(td);
    truthTable.appendChild(tr);
  }
  /**
   * list all case and computed it.
   * 
   * @param { string[] } allVar
   * @param { string[] } trueOrFalse
   */
  function listAll(allVar, trueOrFalse) {
    const maxLength = ( 2 ** allVar.length - 1).toString(2).length;
    for(let i = 0; i < 2 ** (allVar.length - trueOrFalse.length); i++) {
      let bin = '';
      for( let j = i.toString(2).length; j < maxLength; j++) {
        bin += '0';
      }
      bin += i.toString(2);
      let valueCase = {};
      for( let j = 0; j < bin.length; j++) {
        if( allVar[j] === 'T') {
          valueCase[allVar[j]] = true; 
        } else if( allVar[j] === 'F') {
          valueCase[allVar[j]] = false;
        } else {
          valueCase[allVar[j]] = bin[j] === '1' ? true : false;
        }
      }
      createTableTd(valueCase, compute(valueCase));
    }
  }

  let tr = document.createElement('tr');
  const allVar = removeDulicateVars();
  const trueOrFalse = extractTrueOrFalse();
  for(let it of allVar) {
    let th = document.createElement('th');
    if( it === 'T') {
      th.innerHTML = "<span>" + '⊤' + "</span>";  
    } else if( it === 'F') {
      th.innerHTML = "<span>" + '⊥' + "</span>";  
    } else {
      th.innerHTML = "<span>" + it + "</span>";
    }
    tr.appendChild(th);
  }
  //创建表头
  let th = document.createElement('th') ;
  th.innerHTML = "<span style='font-weight:600;'>" + inExpWithParen + "</span>";
  tr.appendChild(th);
  truthTable.innerHTML = "";
  truthTable.appendChild(tr);
  listAll(allVar,trueOrFalse)
}

// const Line = "(a \\/ b) /\\ c -> (d <-> e)";
// const Line = "( test /\\ aaadw /\\ (_fds<->a /\\ T \\/ fn) ^ dcx \\/ vd) /\\ ~ s1sand <->(notaf<->~~fforad)->F/\\(~not -> xwtqs^a)->we/\\b\\/(adcc/\\b)";
// const Line = "(a ^ b) /\\ T \\/ F";
// const Line = "a -> sd + asdf";

let input = document.getElementById('input')
let errorInfo = document.getElementById('error')
let truthTable = document.getElementById('table')

input.addEventListener("input", () => {
  console.log('---------------------------')
  truthTable.innerHTML = ""
  if( !input.value.trim().length) {
    errorInfo.innerHTML = ""
    return ;
  }
  console.log( "value: ", input.value)
  let inputArr = tokenizer(input.value);
  const postExp = inToPost(inputArr);
  console.log('postExp: ', postExp);
  const checkResult = check(postExp);
  if( !checkResult) {
    console.log('input has wrong formate')
    return ;
  }
  const inExpWithParen = postToInWithParentheses(postExp);
  computeAll(postExp, inExpWithParen)
})


import { PropNot, PropVar, Prop, PropAnd, PropOr, PropImplies, PropEqual, PropXor, PropTrue, PropFalse } from "./props";

const priority = ["~", "/\\", "^", "\\/", "->", "<->"];

/**
 * check a variable name is satisfy rules.
 * 
 * @param varName 
 * @returns {boolean}
 */
const satisfyVariable = (varName:string) => {
  function satisfyFirstChar(char:string) {
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
 * check the correctness of inputLine 
 * 
 * rules:
 * var: satisfyVariable(var) === true && can't adjacent between more than one vars.
 * parentheses: left and right have same numbers && the sentence insides of paren is right.
 * conjunction: only ~ can adjacent, and others is not support.
 * 
 * @param inputArr 
 * @param conjunction 
 * 
 * @returns {Boolean}
 */
const check = (inputArr:string[], conjunction:string[]) => {
  let checkStack:string[] = [];

  for(let it of inputArr) {
    const s = it.trim();
    if( s.length === 0) {
      console.log(s, "is a redundant space");
      return false;
    } else if( checkStack.length === 0) {
      checkStack.push( s);
    } else if( s === '(') {
      if( checkStack.length !== 0 && conjunction.indexOf(checkStack[checkStack.length - 1]) === -1) {
        console.log(s, 'left is wrong');
        return s;
      }
      checkStack.push( s);
    } else if( s === ')') {
      if( checkStack.length === 0) {
        console.log(s, ' don\' have left paren.');
        return false;
      }
      const temp = checkStack.pop();
      if( checkStack.length === 0) {
        console.log(s, ' don\' have left paren.');
        return false;
      } else {
        checkStack.pop(); // pop() 弹出的应该是 '(', 因为之后的代码保证了括号内部一定是一个有效的语句
        // 随后，看看是否需要结合之前的 ~
        while( checkStack.length && checkStack[checkStack.length-1] === '~'){
          checkStack.pop();
        }
        checkStack.push(temp); 
      }
    } else if( conjunction.indexOf(s) !== -1) {
      if( s === '~') {
        while( checkStack.length && checkStack[checkStack.length - 1] === '~') {
          checkStack.pop();
        }
        if(checkStack.length && (
          (checkStack[checkStack.length-1] === '(') ||
          (conjunction.indexOf(checkStack[checkStack.length - 1]) !== -1))
          ) {
          checkStack.push(s);
        } else {
          console.log(s, 'left should be a var.')
          return false;
        }
      } else {
        if(checkStack.length === 0 ||
          checkStack[checkStack.length - 1] === '(' ||
          conjunction.indexOf( checkStack[checkStack.length - 1]) !== -1 
          ) {
          console.log(s, " left should be a vars")
          return false;
        } else{
          checkStack.push( s);
        }
      }
    } else if( satisfyVariable(s)) {
      if( checkStack.length === 0 
        || checkStack[checkStack.length - 1] === '(')  {
        checkStack.push(s);
      } else if( satisfyVariable(checkStack[checkStack.length - 1])) {
        console.log(s, " left should be a conjunction")
        return false;
      } else {
          const sign = checkStack.pop();
        if( sign === '~') {
          checkStack.push(s);
        } else if( checkStack.length === 0) {
          console.log(s, 'lack of  left vars');
          return false;
        } else {
          checkStack.pop();
          checkStack.push(s);
        }
      }
    } else {
      console.log( s, ' is not a valid var name.');
      return false;
    }
  }
  return true;
}

/**
 * tokenizer inputLine to .
 * 
 * @param inputLine 
 * 
 */
const tokenizer = (inputLine:string) => {
  // console.log(inputLine)
  const pattern = /(\s*~\s*|\s*\/\\\s*|\s*\^\s*|\s*\\\/\s*|\s*->\s*|\s*<->\s*|\s*\(\s*|\s*\)\s*| )/g
  // cut
  const inputArr = inputLine.split(pattern).filter(value=>value.length);
  // parse to tokenizer
  if(!check(inputArr, priority)) {
    throw new Error('The string your input is not valid!');
  }
  return inputArr.map(value => value.trim());
}

/**
 * according to the syntax, parse to Props.
 * 
 * @param inputArr 
 */
const parser = (inputArr:string[]) => {
  
  /**
   * transform infix-expression to post-expression
   * pay attention! the inputArr must be valid.
   *
   * @param {string[]} inputArr
   */
  function inToPost( inputArr:string[]) {
    let recordStack:string[] = [];
    let result:string[] = [];

    function isSatisfyCondition(index:number) {
      return recordStack.length 
          && recordStack[recordStack.length - 1] !== '('
          && ( priority.indexOf(recordStack[recordStack.length - 1])) < index;
    }

    for( let it of inputArr) {
      // console.log('recordStack:', recordStack);
      // console.log('result:',result);
      // console.log();
      if( satisfyVariable(it)) {
        result.push(it);
        continue;
      }
      if( recordStack.length === 0) {
        recordStack.push( it);
        continue;
      }
      switch(it) {
        case "(":
          recordStack.push( it);
          break;
        case ")":
          while( recordStack.length && recordStack[ recordStack.length - 1] !== '(') {
            result.push( recordStack.pop());
          }
          if( recordStack.length) {
            recordStack.pop();
          }
          break;
        case "~":
          recordStack.push(it);
          break;
        case '/\\':
          while( isSatisfyCondition(2)) {
            result.push(recordStack.pop());
          }
          recordStack.push(it);
          break;
        case "^":
          while( isSatisfyCondition(3)){
            result.push(recordStack.pop());
          }
          recordStack.push(it);
          break;
        case "\\/":
          while(isSatisfyCondition(4)){
            result.push(recordStack.pop());
          }
          recordStack.push(it);
          break;
        case "->":
          while( isSatisfyCondition(5)){
            result.push(recordStack.pop());
          }
          recordStack.push(it);
          break;
        case "<->":
          while( isSatisfyCondition(6)){
            result.push(recordStack.pop());
          }
          recordStack.push(it);
          break;
        default:
          break;
      }
    }
    while( recordStack.length) {
      result.push( recordStack.pop());
    }
    return result;
  }

  /**
   * transform post-exp to in-exp with parentheses.
   * And also, the inputArr is post-exp and it must be valid.
   * @param {string[]} inputArr
   */
  function postToInWithParentheses( inputArr:string[]) {
    let recordPropStack = [];
    for( let it of inputArr) {
      // console.log('recordPropStack:', recordPropStack);
      // console.log(); 
      if( priority.indexOf( it) !== -1) {
        let conjunctionProp: Prop;
        if( it === '~') {
          conjunctionProp = new PropNot( recordPropStack.pop());
        } else {
          const tempProp1 = recordPropStack.pop();
          const tempProp2 = recordPropStack.pop();
          switch(it){
            case '/\\':
              conjunctionProp = new PropAnd( tempProp2, tempProp1);
              break;
            case '\\/':
              conjunctionProp = new PropOr( tempProp2, tempProp1);
              break;
            case '->':
              conjunctionProp = new PropImplies( tempProp2, tempProp1);
              break;
            case '<->':
              conjunctionProp = new PropEqual( tempProp2, tempProp1);
              break;
            case '^':
              conjunctionProp = new PropXor( tempProp2, tempProp1);
              break;
          }
        }
        recordPropStack.push( conjunctionProp);
        continue;
      }
      if( it !== '(' && it !== ')') {
        if( it === 'T') {
          recordPropStack.push( new PropTrue());
        } else if( it === 'F'){
          recordPropStack.push( new PropFalse());
        } else {
          recordPropStack.push( new PropVar(it));
        }
      }
    }
    return recordPropStack.pop(); // 此时，栈内部大小肯定为 1.
  }
  // console.log( inToPost( inputArr))
  // console.log( postToInWithParentheses(inToPost( inputArr)));
  const postExp = inToPost(inputArr);
  const parseExp = postToInWithParentheses(postExp);
  return {
    postExp,
    inExpWithParen: parseExp.toString(),
    propExp: parseExp
  } 
}

// const Line = "(a \\/ b) /\\ c -> (d <-> e) ^ f";
const Line = "( test /\\ (_fds<->a /\\ T \\/ fn) ^ dcx \\/ vd) /\\ ~ s1sand <->(notaf<->~~fforad)->F/\\(~not -> xwtqs^a)->we/\\b\\/(adcc/\\b)";
console.log(parser(tokenizer(Line)));
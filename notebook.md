# 写一个真值表

好久没接触命题逻辑，很多内容容易忘记，所以写一款真值表小工具，用来回忆。

## 数学

我们的输出遵从以下规则：

非：
|p|~p|
|-|-|-|
|F|T|
|T|F|

或：
|p|q|p \\/ q|
|-|-|-|
|F|F|F|
|F|T|T|
|T|F|T|
|T|T|T|

与：
|p|q|p /\ q|
|-|-|-|
|F|F|F|
|F|T|F|
|T|F|F|
|T|T|T|

蕴含：
|p|q|p -> q|
|-|-|-|
|F|F|T|
|F|T|T|
|T|F|F|
|T|T|T|

全等:
|p|q|p <-> q|
|-|-|-|
|F|F|T|
|F|T|F|
|T|F|F|
|T|T|T|

异或：
|p|q|p ^ q|
|-|-|-|
|F|F|F|
|F|T|T|
|T|F|T|
|T|T|F|

另外，连接词优先级从大到小排列有：~, /\, ^, \/, ->, <->.


(以下过程已作废)

## 算法

### 数据结构

首先定义一套数据结构，该数据结构描述了最基本的命题逻辑(Prop.ts)。

```javascript
class Prop {
}

class PropVar extends Prop {
  private variable: string;

  constructor(variable: string) {
    super();
    this.variable = variable;
  }
  toString() {
    return this.variable;
  }
}

class PropTrue extends Prop  {
  constructor() {
    super();
  }
  toString() {
    return '⊤';
  }
}

class PropFalse extends Prop {
  constructor() {
    super();
  }
  toString() {
    return '⊥';
  }
}

class PropNot extends Prop {
  private variable:PropVar;
  constructor(variable:PropVar) {
    super();
    this.variable = variable;
  }
  toString() {
    return (new PropLeftParen).toString() + "¬" + this.variable + (new PropRightParen).toString();
  }
}

class PropAnd extends Prop {
  private left:PropVar;
  private right:PropVar; 
  constructor(leftVar:PropVar, rightVar:PropVar) {
    super();
    this.left = leftVar;
    this.right = rightVar;
  }
  toString() {
    return (new PropLeftParen).toString() + this.left + " /\\ " + this.right + (new PropRightParen).toString();
  }

}

class PropOr extends Prop {
  private left:PropVar;
  private right:PropVar;
  constructor(leftVar:PropVar, rightVar:PropVar) {
    super();
    this.left = leftVar;
    this.right = rightVar;
  }
  toString() {
    return (new PropLeftParen).toString() + this.left + " \\/ " + this.right + (new PropRightParen).toString();
  }
}

class PropImplies extends Prop {
  private left:PropVar;
  private right:PropVar;
  constructor(leftVar:PropVar, rightVar:PropVar) {
    super();
    this.left = leftVar;
    this.right = rightVar;
  }
  toString() {
    return (new PropLeftParen).toString() + this.left + " -> " + this.right + (new PropRightParen).toString();
  }
}

class PropEqual extends Prop {
  private left:PropVar;
  private right:PropVar;
  constructor(leftVar:PropVar, rightVar:PropVar) {
    super();
    this.left = leftVar;
    this.right = rightVar;
  }
  toString() {
    return (new PropLeftParen).toString() + this.left + " <-> " + this.right + (new PropRightParen).toString();
  }
}

class PropXor extends Prop {
  private left:PropVar;
  private right:PropVar;
  constructor(leftVar:PropVar, rightVar:PropVar) {
    super();
    this.left = leftVar;
    this.right = rightVar;
  }
  toString() {
    return (new PropLeftParen).toString() + this.left + " ^ " + this.right + (new PropRightParen).toString();
  }
}


class PropLeftParen extends Prop {
  constructor(){
    super();
  }
  toString(){
    return '(';
  }
}

class PropRightParen extends Prop {
  constructor(){
    super();
  }
  toString(){
    return ')';
  }
}

export {
  Prop,
  PropVar,
  PropTrue,
  PropFalse,
  PropAnd,
  PropOr,
  PropXor,
  PropNot,
  PropImplies,
  PropEqual
};
```

（写到最后，发现其实只用上 toString() 部分。。）

### 编译

之后，便是写一个简单的编译器，将输入的命题逻辑拆分成以上的数据结构的形式。

假定存在一个输入的字符串 inputLine, 该字符串中描述的是一个命题逻辑。

先确定连接词：

```javascript
const formats = ["/\\", "\\/",   "~", "->", "<->", "^"];
```

据此，可以确定语法树：

```bash
E1 ::= E1 <-> E2
E2 ::= E2  -> E3
E3 ::= E3  \/ E4
E4 ::= E4  ^  E5
E5 ::= E5  /\ E6
E6 ::= ~E6
```

往下大致的结构就是：

```bash
inputLine -> 词法解析器 tokenizer
          -> 符号串
          -> 文法分析器 parser
          -> 抽象语法树 parse
          -> 后端代码生成
          -> 目标代码生成
```

首先是 词法解析器，这一部分的目的就是将  `a/\b`, 解析为 `PropAnd(Prop('a'), Prop('b'))`, 这里简写为 `['a', '/\', 'b']`, 以符号串的形式存储。另外此处，还是利用栈来检测用户输入内容格式的是否正确：

```javascript

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
        return false;
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
```

走完以上代码，我们已经可以实现了最核心的功能。接下来，只需要转化为 Props（其实不转也没事），之后枚举计算即可。

```javascript
/**
 * enumerate all cases and calculate
 * 
 * @param postExp 
 */
const computeAll = (postExp:string[]) => {
  /**
   * remove duplicate
   */
  function remove() {
    return postExp.filter(value => value !== '(' && value !== ')' && priority.indexOf(value) === -1).filter((value, index,arr) => arr.indexOf(value, index + 1) === -1);
  }
  /**
   * list all case and computed it.
   */
  function listAll() {
    const allVar = remove();
    const maxLength = ( 2 ** allVar.length - 1).toString(2).length;
    for(let i = 0; i < 2 ** allVar.length; i++) {
      let bin:string = '';
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
      console.log(valueCase);
      console.log( compute(valueCase));
      console.log();
    }
  }
  
  /**
   * 
   * @param valueCase 
   */
  function compute(valueCase:object) {
    /**
     * defined rules
     * 
     * @param input1 
     * @param input2 
     * @param sign 
     */
    function rules(input1: boolean, input2: boolean = false, sign: string) {
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
    let recordPropStack:boolean[] = [];
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
  listAll()
}
```


## 样式

决定使用 h5 + css 做页面，首先就是脑海中有一个样式（当然有条件可以做一个 UI 图），之后便可以开始 coding.

具体过程就不写了，这里给出 html 和 css 的代码和最终生成结果：

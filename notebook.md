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

异或：
|p|q|p ^ q|
|-|-|-|
|F|F|F|
|F|T|T|
|T|F|T|
|T|T|F|

全等:
|p|q|p <-> q|
|-|-|-|
|F|F|T|
|F|T|F|
|T|F|F|
|T|T|T|

另外，连接词优先级从大到小排列有：~, /\, ^, \/, ->, <->.

## 算法

### 数据结构

首先定义一套数据结构，该数据结构描述了最基本的命题逻辑(Prop.ts)。

```javascript
enum PropValue {
  PropFalse = 0,
  PropTrue = 1
}

class Prop {
}

class PropVar extends Prop {
  private variable: string;
  private value: PropValue;

  constructor(variable: string, value: PropValue = PropValue.PropFalse) {
    super();
    this.variable = variable;
    this.value = value;
  }
  toString() {
    return this.variable;
  }
  getResult() {
    return this.value;
  }
}

class PropTrue extends Prop {
  constructor() {
    super();
  }
  toString() {
    return 'T';
  }
  getResult() {
    return PropValue.PropTrue;
  }
}

class PropFalse extends Prop {
  constructor() {
    super();
  }
  toString() {
    return 'F';
  }
  getResult() {
    return PropValue.PropFalse;
  }
}

class PropNot extends Prop {
  private variable:PropVar;
  constructor(variable:PropVar) {
    super();
    this.variable = variable;
  }
  getVar() {
    return this.variable;
  }
  toString() {
    return (new PropLeftParen).toString() + "¬" + this.variable + (new PropRightParen).toString();
  }
  getResult() {
    return this.variable.getResult() === PropValue.PropFalse ? PropValue.PropTrue : PropValue.PropTrue;
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
  getResult() {
    return (this.left.getResult() && this.right.getResult()) === PropValue.PropTrue 
            ?  
            PropValue.PropTrue
            :
            PropValue.PropFalse;
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
  getResult() {
    return (this.left.getResult() || this.right.getResult()) === PropValue.PropFalse
          ?
          PropValue.PropFalse
          :
          PropValue.PropTrue;
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
  getResult() {
    return new PropOr( new PropNot(this.left).
    etVar(), this.right).getResult();
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
  getResult() {
    return this.left.getResult() === this.right.getResult() ? PropValue.PropTrue : PropValue.PropFalse;
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
  getResult() {
    return this.left.getResult() === this.right.getResult() ? PropValue.PropFalse : PropValue.PropTrue;
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
  PropValue,
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
  const priority = ["~", "/\\", "^", "\\/", "->", "<->"];
  const pattern = /(\s*~\s*|\s*\/\\\s*|\s*\^\s*|\s*\\\/\s*|\s*->\s*|\s*<->\s*|\s*\(\s*|\s*\)\s*| )/g
  // cut
  const inputArr = inputLine.split(pattern).filter(value=>value.length);
  // parse to tokenizer
  if(!check(inputArr, priority)) {
    throw new Error('The string your input is not valid!');
  }
  return inputArr.map(value => value.trim()).join('');
}
```

再往下一部分，parser:

这里需要考虑一个非常重要的问题：如何保证生成的语法树的正确性？以四则运算为例，1 + 2 * 3 和 (1 + 2) * 3 稍有不慎，即可能生成完全一样的语法树，从而导致计算错误。

其实，到这里之后，我也卡了很久，从刚开始的递归思路，一直想到想到事情的关键：计算顺序。

语法树的目的是生成正确的计算顺序，此时，完全可以用栈来实现。

```javascript
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
    let recordStack:string[] = [];
    for( let it of inputArr) {
      console.log('recordStack:', recordStack);
      console.log(); 
      if( priority.indexOf( it) !== -1) {
        let conjunction:string;
        if( it === '~') {
          conjunction = '(~' +recordStack.pop() +')';
        } else {
          const temp1 = recordStack.pop(); // 为了保持原有顺序
          const temp2 = recordStack.pop();
          // result.push('(');
          // result.push( temp2);
          // result.push( it);
          // result.push( temp1); 
          // result.push(')');
          conjunction = '(' + temp2 + it + temp1 + ')';
        }
        recordStack.push( conjunction);
        continue;
      }
      switch(it) {
        case '(':
        case ')':
        default :
          recordStack.push( it);
      }
    }
    return recordStack;
  }
  console.log( inToPost( inputArr))
  console.log( postToInWithParentheses(inToPost( inputArr))); 
}
```

走完以上代码，我们已经可以实现了最核心的功能。接下来，只需要转化为 Props（其实不转也没事），之后枚举计算即可。

为了保证风格的统一，我们将上述生成的代码转化为 Props 的形式。

## 样式

决定使用 h5 + css 做页面，首先就是脑海中有一个样式（当然有条件可以做一个 UI 图），之后便可以开始 coding.

具体过程就不写了，这里给出 html 和 css 的代码和最终生成结果：

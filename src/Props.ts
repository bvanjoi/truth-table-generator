enum PropValue {
  PropFalse,
  PropTrue
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
}

class PropTrue extends Prop {
  constructor() {
    super();
  }
  toString() {
    return 'T';
  }
}

class PropFalse extends Prop {
  constructor() {
    super();
  }
  toString() {
    return 'F';
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
// test
// 除了 proxy 之外，好奇 js 中有无类似于 python 中 __str__ 的函数？
// const p = new PropVar("p");
// const q = new PropVar("q");
// console.log( p.toString());
// const testAnd = new PropAnd(p,q);
// console.log(testAnd.toString());
// const testOr = new PropOr(p,q);
// console.log(testOr.toString());
// const testXor = new PropXor(p,q);
// console.log(testXor.toString());
// const testNot = new PropNot(p);
// console.log(testNot.toString());
// const testImplies = new PropImplies(p,q);
// console.log(testImplies.toString());
// const testEqual = new PropEqual(p,q);
// console.log(testEqual.toString());

// 返回的结果是 false, 这里就需要确定如何保证两个同样的字符串只生成一个 PropVar();
console.log( new PropVar('a') === new PropVar('a')) 

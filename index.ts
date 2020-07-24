const formats = [
  ["/\\", "\\/",   "~", "->", "<->", "^"],
  ["/\\", "\\/",   "¬", "->",   "↔", "^"],
  ["and",  "or", "not", "=>", "<=>", "^"],
  [ "&&",  "||",   "!", "=>",   "↔", "^"]
];


class Prop {
}

class PropVar extends Prop {
  private var:string;
  constructor(variable: string) {
    super();
    this.var = variable;
  }
  toString() {
    return this.var;
  }
}

class PropTrue extends Prop {
  constructor() {
    super();
  }
}

class PropFalse extends Prop {
  constructor() {
    super();
  }
}

class PropNot extends Prop {
  private var:PropVar;
  constructor(variable:PropVar) {
    super();
    this.var = variable;
  }
  toString() {
    return "~" + this.var;
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
    return "(" + this.left + " /\\ " + this.right + ")";
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
    return "(" + this.left + " \\/ " + this.right + ")";
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
    return "(" + this.left + " -> " + this.right + ")";
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
    return "(" + this.left + " <-> " + this.right + ")";
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
    return "(" + this.left + " ^ " + this.right + ")";
  }
}

const p = new PropVar("p");
const q = new PropVar("q");
let test = new PropNot(p);
console.log(test.toString());

/**
 * 
 * 
 * @param {string} inputLine 
 */
const parentheses = (inputLine) => {

}

const inputLine = "test/\\fds↔afcx\/vd&&sa~ds<->(af<=>ffad)->ds!af=>asx¬(wetqs^a)";
const pattern = /\/\\|\/|and|&&|or|\|\||!|~|not|~|¬|->|=>|\^|xor|↔|<->|<=>/gi;
console.log(inputLine.split(pattern));
console.log(inputLine.match(pattern));
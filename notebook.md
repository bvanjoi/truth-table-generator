# 写一个真值表

好久没接触命题逻辑，很多内容容易忘记，所以写一款真值表小工具，用来回忆。

## 数学

我们的输出遵从以下规则：

非：
|p|~p|
|-|-|-|
|F|T|
|T|F|

与：
|p|q|p /\ q|
|-|-|-|
|F|F|F|
|F|T|F|
|T|F|F|
|T|T|T|

或：
|p|q|p \\/ q|
|-|-|-|
|F|F|F|
|F|T|T|
|T|F|T|
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

另外，连接词优先级从大到小排列有：~, /\, ^, \/, ->, <->.

## 算法

首先定义一套数据结构，该数据结构描述了最基本的命题逻辑(Prop.ts)。

```javascript
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
    return "(¬" + this.var + ")";
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

之后，

假定存在一个输入的字符串 inputLine, 该字符串中描述的是一个命题逻辑。

先确定连接词：

```javascript
const formats = ["/\\", "\\/",   "~", "->", "<->", "^"];
```

确定连接词后可以想到，由于计算命题逻辑的优先级不同，需要原本的 inputLine 转化为带有括号的形式，例如 a || b -> c && d <-> (e -> !f)  -----> (((a || b) -> (c && d)) <-> (e → !f))

## 样式

决定使用 h5 + css 做页面，首先就是脑海中有一个样式（当然有条件可以做一个 UI 图），之后便可以开始 coding.

具体过程就不写了，这里给出 html 和 css 的代码和最终生成结果：

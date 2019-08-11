const LTLOperator = {
  not: "not",
  and: "and",
  or: "or",
  next: "next",
  always: "always",
  eventually: "eventually"
};

function evalT(formula, lookup = () => {}) {
  if (typeof formula === "boolean") {
    return formula;
  } else if (typeof formula === "string") {
    const val = lookup(formula);
    if (typeof val !== "boolean") {
      throw new Error(`lookup(formula) returned non-boolean value ${val}`);
    }
    return val;
  }

  if (formula.type === LTLOperator.not) {
    const f = evalT(formula.value, lookup);
    return typeof f === "boolean" ? !f : { type: LTLOperator.not, value: f };
  } else if (formula.type === LTLOperator.and) {
    const fs = formula.value.map(f => evalT(f, lookup));
    if (fs.indexOf(false) !== -1)
      // conjunction contains a false
      return false;
    const fsWOBool = fs.filter(f => typeof f !== "boolean");
    return fsWOBool.length === 0
      ? true // an empty conjunction is a conjunction of trues
      : fsWOBool.length === 1
      ? fsWOBool[0] // "and" with one formula is just that formula
      : {
          type: LTLOperator.and,
          value: fsWOBool
        };
  } else if (formula.type === LTLOperator.or) {
    const fs = formula.value.map(f => evalT(f, lookup));
    if (fs.indexOf(true) !== -1)
      // disjunction contains a true
      return true;
    const fsWOBool = fs.filter(f => typeof f !== "boolean");
    return fsWOBool.length === 0
      ? false // an empty disjunction is a disjunction of falses
      : fsWOBool.length === 1
      ? fsWOBool[0] // "or" with one formula is just that formula
      : {
          type: LTLOperator.or,
          value: fsWOBool
        };
  } else if (formula.type === LTLOperator.next) {
    return formula.value;
  } else if (formula.type === LTLOperator.always) {
    const f = evalT(formula.value, lookup);
    return typeof f === "boolean"
      ? !f
        ? f // false! done!
        : formula // if f is true, keep evaluating formula
      : {
          type: LTLOperator.and,
          value: [f, formula] // f is a partially evaluated formula
        };
  } else if (formula.type === LTLOperator.eventually) {
    const f = evalT(formula.value, lookup);
    return typeof f === "boolean"
      ? f
        ? f // true! done!
        : formula // if f is false, keep evaluating formula
      : {
          type: LTLOperator.or,
          value: [f, formula] // f is a partially evaluated formula
        };
  } else {
    throw new Error(`Unknown type: ${formula.type}`);
  }
}

module.exports = {
  LTLOperator: LTLOperator,
  evalT: evalT
};

const fc = require("fast-check");
const { LTLOperator, evalT } = require("../");

test("boolean", () => {
  fc.property(fc.boolean(), data => {
    expect(evalT(data)).toEqual(data);
  });
});

test("variable", () => {
  const alphabet = () =>
    fc
      .oneof(fc.integer(0x41, 0x5a), fc.integer(0x61, 0x7a))
      .map(String.fromCharCode);
  fc.assert(
    fc.property(fc.tuple(alphabet(), fc.boolean()), data => {
      expect(evalT(data[0], key => data[1])).toEqual(data[1]);
    }),
    { verbose: true }
  );
  fc.assert(
    fc.property(fc.tuple(alphabet(), fc.boolean()), data => {
      expect(() => {
        evalT(data[0]);
      }).toThrow();
    }),
    { verbose: true }
  );
});

test("not", () => {
  fc.assert(
    fc.property(fc.boolean(), data => {
      expect(
        evalT({
          type: LTLOperator.not,
          value: data
        })
      ).toEqual(!data);
    }),
    { verbose: true }
  );
});

test("and", () => {
  fc.assert(
    fc.property(fc.array(fc.boolean()), data => {
      expect(
        evalT({
          type: LTLOperator.and,
          value: data
        })
      ).toEqual(data.indexOf(false) === -1);
    }),
    { verbose: true }
  );
});

test("or", () => {
  fc.assert(
    fc.property(fc.array(fc.boolean()), data => {
      expect(
        evalT({
          type: LTLOperator.or,
          value: data
        })
      ).toEqual(data.indexOf(true) !== -1);
    }),
    { verbose: true }
  );
});

test("next", () => {
  fc.assert(
    fc.property(fc.boolean(), data => {
      const f = {
        type: LTLOperator.next,
        value: data
      };
      expect(evalT(evalT(f))).toEqual(data);
    }),
    { verbose: true }
  );
});

test("always", () => {
  const formula = {
    type: LTLOperator.always,
    value: "a"
  };
  fc.assert(
    fc.property(fc.array(fc.boolean()), data => {
      const result = data.reduce((f, d) => {
        return evalT(f, key => d);
      }, formula);
      const expected = data.every(d => d) ? formula : false;
      expect(result).toEqual(expected);
    }),
    { verbose: true }
  );
});

test("eventually", () => {
  const formula = {
    type: LTLOperator.eventually,
    value: "a"
  };
  fc.assert(
    fc.property(fc.array(fc.boolean()), data => {
      const result = data.reduce((f, d) => {
        return evalT(f, key => d);
      }, formula);
      const expected = data.some(d => d) ? true : formula;
      expect(result).toEqual(expected);
    }),
    { verbose: true }
  );
});

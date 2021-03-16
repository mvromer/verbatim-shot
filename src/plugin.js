/**
 * @returns {Chai.ChaiPlugin}
 */
export const verbatimSnapshot = () => {
  return (chai, utils) => {
    chai.Assertion.addMethod('matchVerbatimSnapshot', function () {
      console.log(`Inside matcher: ${this}`);
      console.log(this);
    });
  };
};

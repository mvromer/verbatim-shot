/**
 * @returns {Chai.ChaiPlugin}
 */
export const verbatimSnapshot = () => {
  return (chai, utils) => {
    console.log(`Inside plugin: ${this}`);
  };
};

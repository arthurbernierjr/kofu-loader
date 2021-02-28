class MambaScriptError extends Error {
  constructor(error) {
    super(error);

    this.name = 'MambaScriptError';
  }
}

export default MambaScriptError;

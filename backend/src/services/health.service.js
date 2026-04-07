const getHealthPayload = () => {
  return {
    status: 'ok',
    checkedAt: new Date().toISOString(),
  };
};

module.exports = {
  getHealthPayload,
};

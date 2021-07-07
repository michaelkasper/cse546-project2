const {
          REACT_APP_DEBUG,
          REACT_APP_ENV,
          REACT_APP_API
      } = process.env;

module.exports = {
    ENV  : REACT_APP_ENV,
    API  : REACT_APP_API,
    DEBUG: REACT_APP_DEBUG === "true",
}

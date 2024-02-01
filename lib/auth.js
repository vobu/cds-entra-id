const cds = require("@sap/cds")
const LOG = cds.log("entra-id")

// To debug this module set export DEBUG=cds-entra-id
const DEBUG = cds.debug("cds-entra-id")

const EntraIdUser = class extends cds.User {
  is(role) {
    DEBUG && DEBUG("Requested role: " + role)
    return super.is(role)
  }
}

module.exports = (req, _, next) => {
  try {
    req?.headers["x-ms-client-principal"] &&
      DEBUG &&
      DEBUG(
        "req.headers.x-ms-client-principal",
        JSON.parse(Buffer.from(req.headers["x-ms-client-principal"], "base64").toString())
      )

    req?.headers["x-ms-token-aad-id-token"] &&
      DEBUG &&
      DEBUG(
        "req.headers.x-ms-token-aad-id-token",
        JSON.parse(Buffer.from(req.headers["x-ms-token-aad-id-token"].split(".")[1], "base64").toString())
      )

    let _user
    if (req.headers["x-ms-client-principal-name"]) {
      _user = new EntraIdUser(req.headers["x-ms-client-principal-name"])
      _user.roles["authenticated-user"] = 1 //> at this point, we're always authenticated!
    } else {
      _user = new cds.User() //> anon user; REVISIT: what about system aka technical users?
    }

    // add app roles https://learn.microsoft.com/en-us/security/zero-trust/develop/configure-tokens-group-claims-app-roles
    // and groups https://learn.microsoft.com/en-us/entra/identity-platform/optional-claims#configure-groups-optional-claims
    // note on groups: are always GUIDs to prevent malice!
    if (req.headers["x-ms-token-aad-id-token"]) {
      const decodedAadIdToken = JSON.parse(
        Buffer.from(req.headers["x-ms-token-aad-id-token"].split(".")[1], "base64").toString()
      )
      if (decodedAadIdToken.roles && Array.isArray(decodedAadIdToken.roles)) {
        decodedAadIdToken.roles.forEach(role => (_user.roles[role] = 1))
        DEBUG && DEBUG("added app roles", decodedAadIdToken.roles)
      }
      if (decodedAadIdToken.groups && Array.isArray(decodedAadIdToken.groups)) {
        decodedAadIdToken.groups.forEach(group => (_user.roles[group] = 1))
        DEBUG && DEBUG("added group claims", decodedAadIdToken.groups)
      }
    }
    req.user = _user

    LOG.info("entra id User", _user)
  } catch (error) {
    LOG.error("oi!", error)
    LOG.error("continuing as not to break app flow..")
  }
  next()
}

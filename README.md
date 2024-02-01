# cds-entra-id

A SAP Cloud Application Programming Model (CAP) plugin to map Entra ID *authorization* to the `cds.User` scope.

It is intended as a drop-in **authorization** mapper for a CAP app running on Azure AppServices - not (!) locally. The plugin *does not support any authentication flow*, but the mapping of Entra ID artefacts to CAP roles for declarative authorization.

## Requirements

:exclamation: Your CAP app must be protected by [OAuth 2.0 authorization with Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/architecture/auth-oauth2), configured via the `App Service` → `Settings` → `Authentication`

Both `Entra ID Groups` (https://learn.microsoft.com/en-us/entra/identity-platform/optional-claims#configure-groups-optional-claims) and `App roles` https://learn.microsoft.com/en-us/security/zero-trust/develop/configure-tokens-group-claims-app-roles  are supported to be subsequentially used for annotation in CDS files.

## Installation + Configuration

```shell
npm i --save cds-entra-id
```

Then tell your CAP app to use this plugin (see https://cap.cloud.sap/docs/node.js/cds-env#sources-for-cds-env for possible config file locations and configuration options).

E.g. in `./.cdsrc.json`:

```json
{
  "requires": {
    "auth": {
      "[development]": { // <-- let's keep local dev as is
        "kind": "mocked"
      },
      "[production]": { // <-- grow as you go when deployed to Azure
        "impl": "cds-entra-id"
      }
    }
  }
}
```

For Debugging purposes, you can set the enviornment variable `DEBUG=cds-entra-id` as with [all CAP `DEBUG` options](https://cap.cloud.sap/docs/node.js/cds-log#debug-env-variable).

## Usage

Annotate your `.cds` services as usual:

```cds
service its {
    @(requires: 'authenticated-user')
    function ok() returns String;
    @(requires: ['7b428506-466b-45b0-9cbf-4e1b20734874', 'test-app-role'])
    function nok() returns String;
}
```

The function import `ok()` requires any authenticated user, no matter the role or group.

However, `nok()` requires the logged in user 

- to be a member of the `Entra ID` group '7b428506-466b-45b0-9cbf-4e1b20734874' or
- a member of the `App role` 'test-app-role'.

Why a GUID for an Entra ID group and not a regular name? Entra ID passes out group memberships only as GUIDs in order to prevent wrongful impersonation. As the note on https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-fed-group-claims explains: 

> "a group name is not unique, and display names can only be emitted for groups explicitly assigned to the application to reduce the security risks. Otherwise, any user could create a group with duplicate name and gain access in the application side."

The same website also states:

> When you're using group membership for in-application authorization, it's preferable to use the group `ObjectID` attribute. The group `ObjectID` attribute is immutable and unique in Microsoft Entra ID. It's available for all groups.

And that's why `cds-entra-id` supports GUIDs for Entra ID group authorizations.

The `App roles` are app-specific (and not valid Entra ID-wide). They are relayed as regular names and can be used as such for CDS annotations.

## Under the hood :blue_car:

The plugin parses the OAuth 2.0 claims into proper CAP User objects.

Additionally, it has no Node.js module dependencies - yay.

## Contributing

:computer: hack away and PR!

- please use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) so the changelog can be auto-generated. Their usage here is guarded by :dog: [husky](https://typicode.github.io/husky/).
- please format the code w/ [Prettier](https://prettier.io). A `.prettierrc` is in the repo.

## License

This work is dual-licensed under Apache 2.0 and the Derived Beer-ware 🍺 License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

Thus, when you like this stuff, buy [any (or all 😆) of the contributors](https://github.com/ui5-community/wdi5/graphs/contributors) a beer when you see them.

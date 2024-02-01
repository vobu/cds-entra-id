import { expect, describe, it, beforeEach, vitest } from "vitest"
import auth from "../lib/auth"
import { mockAaaIdToken, mockPrincipalToken } from "./__assets__/tokens"

describe("auth", () => {
  let mockRequst
  let mockResponse
  let nextFn = vitest.fn()

  beforeEach(() => {
    mockRequst = {}
    mockResponse = {
      json: vitest.fn(),
    }
  })
  it("should retrieve the correct roles", () => {
    mockRequst = {
      headers: {
        "x-ms-client-principal-name": "test@outlook.com",
        "x-ms-token-aad-id-token": mockAaaIdToken,
      },
    }
    auth(mockRequst, {}, nextFn)

    expect(nextFn).toHaveBeenCalledTimes(1)
  })
})

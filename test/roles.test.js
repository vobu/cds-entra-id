import { expect, describe, it, beforeEach, vitest } from "vitest"
import auth from "../lib/auth"
import { mockAaaIdToken } from "./__assets__/tokens"

describe("auth", () => {
  let mockRequest
  let mockResponse
  let nextFn = vitest.fn()

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      json: vitest.fn(),
    }
  })
  it("plug into cap/express flow", () => {
    mockRequest = {
      headers: {
        "x-ms-client-principal-name": "test@outlook.com",
        "x-ms-token-aad-id-token": mockAaaIdToken,
      },
    }
    auth(mockRequest, {}, nextFn)

    expect(nextFn).toHaveBeenCalledTimes(1)
  })
  it("should set req.user properly (incl roles)", () => {
    mockRequest = {
      headers: {
        "x-ms-client-principal-name": "test@outlook.com",
        "x-ms-token-aad-id-token": mockAaaIdToken,
      },
    }
    auth(mockRequest, {}, nextFn)
    expect(mockRequest.user.id).toBe("test@outlook.com")
    expect(mockRequest.user.roles["authenticated-user"]).toBe(1)
    expect(mockRequest.user.roles["37d959b3-1f20-4083-b312-6d216d6883bb"]).toBe(1)
    
  })
  it("should handle roles correctly", () => {
    mockRequest = {
      headers: {
        "x-ms-client-principal-name": "test@outlook.com",
        "x-ms-token-aad-id-token": mockAaaIdToken,
      },
    }
    auth(mockRequest, {}, nextFn)
    const user = mockRequest.user
    expect(user.is("authenticated-user")).toBe(true)
    expect(user.is("any")).toBe(true)
    expect(user.is("37d959b3-1f20-4083-b312-6d216d6883bb")).toBe(true)
  })
})

import { WorkerError, } from "./common.js"

import { handleOptions, corsWrapResponse } from "./handlers/handleCors.js"
import { handlePostOrPut } from "./handlers/handleWrite.js"
import { handleGet } from "./handlers/handleRead.js"
import { handleDelete } from "./handlers/handleDelete.js"

export default {
  async fetch(request, env, ctx) {
    return await handleRequest(request, env, ctx)
  },
}

async function handleRequest(request, env, ctx) {
  try {
    if (request.method === "OPTIONS") {
      return handleOptions(request)
    }
    
    const response = await handleNormalRequest(request, env, ctx)
    if (!isRedirect(response) && response.headers) {
      response.headers.set("Access-Control-Allow-Origin", "*")
    }
    return response
    
  } catch (e) {
    return handleError(e)
  }
}

function handleError(e) {
  if (e instanceof WorkerError) {
    return corsWrapResponse(
      new Response(`Error ${e.statusCode}: ${e.message}\n`, 
      { status: e.statusCode })
    )
  }
  console.log(e.stack)
  return corsWrapResponse(
    new Response(`Error 500: ${e.message}\n`, 
    { status: 500 })
  )
}

const requestHandlers = new Map([
  ['POST', (req, env, ctx) => handlePostOrPut(req, env, ctx, false)],
  ['GET', handleGet],
  ['DELETE', handleDelete],
  ['PUT', (req, env, ctx) => handlePostOrPut(req, env, ctx, true)]
])

async function handleNormalRequest(request, env, ctx) {
  const handler = requestHandlers.get(request.method)
  if (!handler) {
    throw new WorkerError(405, "method not allowed")
  }
  return handler(request, env, ctx)
}

function isRedirect(response) {
  return response.status === 302
}

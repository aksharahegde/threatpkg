import {
  getPackageDetail,
  resolvePackageEcosystem
} from '../../utils/package-detail'

/** @deprecated Prefer GET /api/packages/:ecosystem/:name */
export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Missing package name' })
  }

  if (!process.env.DATABASE_URL) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DATABASE_URL not configured'
    })
  }

  const packageName = decodeURIComponent(name)
  const ecosystem = await resolvePackageEcosystem(packageName)

  if (!ecosystem) {
    throw createError({ statusCode: 404, statusMessage: 'Package not found' })
  }

  const detail = await getPackageDetail(ecosystem, packageName)
  if (!detail) {
    throw createError({ statusCode: 404, statusMessage: 'Package not found' })
  }

  return detail
})

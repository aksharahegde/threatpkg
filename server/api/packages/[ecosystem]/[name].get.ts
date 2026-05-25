import {
  getPackageDetail,
  normalizePackageEcosystem
} from '../../../utils/package-detail'

export default defineEventHandler(async (event) => {
  const ecosystemParam = getRouterParam(event, 'ecosystem')
  const nameParam = getRouterParam(event, 'name')

  if (!ecosystemParam || !nameParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing ecosystem or package name'
    })
  }

  if (!process.env.DATABASE_URL) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DATABASE_URL not configured'
    })
  }

  const ecosystem = normalizePackageEcosystem(ecosystemParam)
  if (!ecosystem) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ecosystem' })
  }

  const packageName = decodeURIComponent(nameParam)
  const detail = await getPackageDetail(ecosystem, packageName)

  if (!detail) {
    throw createError({ statusCode: 404, statusMessage: 'Package not found' })
  }

  return detail
})

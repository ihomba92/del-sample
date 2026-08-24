import axiosClient from './axiosClient'

export const geoApi = {
  search: (query, limit = 8, signal) =>
    axiosClient
      .get('/geo/search', { params: { q: query, limit }, signal })
      .then((response) => response.data.results),
  reverse: (lat, lng, signal) =>
    axiosClient.get('/geo/reverse', { params: { lat, lng }, signal }).then((r) => r.data),
  route: (payload, signal) =>
    axiosClient.post('/geo/route', payload, { signal }).then((r) => r.data.route),
}

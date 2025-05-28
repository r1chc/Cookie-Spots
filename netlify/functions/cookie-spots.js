const { connectToDatabase } = require('./utils/mongodb');

const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const db = await connectToDatabase();
    const cookieSpots = db.collection('cookieSpots');
    const cookieTypes = db.collection('cookieTypes');
    const dietaryOptions = db.collection('dietaryOptions');

    // Parse the path to determine the operation
    const path = event.path.split('/').pop();
    
    switch (event.httpMethod) {
      case 'GET':
        if (path === 'cookie-spots') {
          // Parse query parameters
          const queryParams = event.queryStringParameters || {};
          const page = parseInt(queryParams.page) || 1;
          const limit = parseInt(queryParams.limit) || 10;
          const skip = (page - 1) * limit;
          
          // Build query filter
          let filter = {};
          if (queryParams.search) {
            filter.$or = [
              { name: { $regex: queryParams.search, $options: 'i' } },
              { description: { $regex: queryParams.search, $options: 'i' } },
              { address: { $regex: queryParams.search, $options: 'i' } }
            ];
          }
          
          // Get total count for pagination
          const totalItems = await cookieSpots.countDocuments(filter);
          const totalPages = Math.ceil(totalItems / limit);
          
          // Get cookie spots with pagination
          const spots = await cookieSpots.find(filter)
            .skip(skip)
            .limit(limit)
            .toArray();
          
          // Get cookie types and dietary options
          const [allCookieTypes, allDietaryOptions] = await Promise.all([
            cookieTypes.find({}).toArray(),
            dietaryOptions.find({}).toArray()
          ]);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              cookieSpots: spots,
              pagination: {
                currentPage: page,
                totalPages,
                totalItems
              },
              cookieTypes: allCookieTypes,
              dietaryOptions: allDietaryOptions
            })
          };
        }
        // Handle single spot GET
        const spot = await cookieSpots.findOne({ _id: path });
        return {
          statusCode: spot ? 200 : 404,
          headers,
          body: JSON.stringify(spot || { error: 'Cookie spot not found' })
        };

      case 'POST':
        const newSpot = JSON.parse(event.body);
        const result = await cookieSpots.insertOne(newSpot);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(result)
        };

      case 'PUT':
        const updatedSpot = JSON.parse(event.body);
        const updateResult = await cookieSpots.updateOne(
          { _id: path },
          { $set: updatedSpot }
        );
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updateResult)
        };

      case 'DELETE':
        const deleteResult = await cookieSpots.deleteOne({ _id: path });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(deleteResult)
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error in cookie-spots function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

module.exports = { handler }; 
local table=KEYS[1]
local maxLen=ARGS[2]
local timeout=ARGS[3]
local records=ARGS[4]

local createdAt = redis.call("get", table)

redis.call("sadd", table, records)
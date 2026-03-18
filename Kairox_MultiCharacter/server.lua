-- ==========================================
-- AUTO-PATCH DE LA BASE DE DONNÉES
-- ==========================================
MySQL.ready(function()
    MySQL.Async.execute([[
        ALTER TABLE `users` 
        ADD COLUMN IF NOT EXISTS `nationality` VARCHAR(50) DEFAULT 'Inconnue',
        ADD COLUMN IF NOT EXISTS `placeofbirth` VARCHAR(50) DEFAULT 'Inconnu'
    ]], {}, function()
        print("^2[NiceLifeRP] ^0Base de donnees verifiee avec succes.")
    end)
end)
-- ==========================================

local function sendCharacters(source)
    local rawId = ESX.GetIdentifier(source)
    if not rawId then return end
    
    local pureLicense = string.match(rawId, "license:[%w]+") or rawId

    MySQL.Async.fetchAll('SELECT identifier, firstname, lastname, dateofbirth, skin FROM users WHERE identifier LIKE @identifier', {
        ['@identifier'] = '%' .. pureLicense .. '%'
    }, function(result)
        local characters = {}
        for i=1, #result do
            if not string.find(result[i].identifier, "del:") then
                local slot = 1
                
                local s1 = string.match(result[i].identifier, "char(%d+):")
                local s2 = string.match(result[i].identifier, "_(%d+)$")
                if s1 then slot = tonumber(s1)
                elseif s2 then slot = tonumber(s2) end

                table.insert(characters, {
                    id = result[i].identifier,
                    slot = slot,
                    firstname = result[i].firstname or "Inconnu",
                    lastname = result[i].lastname or "",
                    dateofbirth = result[i].dateofbirth or "01/01/2000",
                    skin = result[i].skin
                })
            end
        end
        TriggerClientEvent('niceliferp_system:showMulticharacter', source, characters)
    end)
end

RegisterNetEvent('niceliferp_system:requestCharacters')
AddEventHandler('niceliferp_system:requestCharacters', function()
    local src = source
    sendCharacters(src)
end)

RegisterNetEvent('niceliferp_system:loadCharacter')
AddEventHandler('niceliferp_system:loadCharacter', function(slot)
    TriggerEvent('esx:onPlayerJoined', source, "char" .. tostring(slot))
end)

RegisterNetEvent('niceliferp_system:deleteCharacter')
AddEventHandler('niceliferp_system:deleteCharacter', function(idToDelete)
    local src = source
    local rawId = ESX.GetIdentifier(src)
    local pureLicense = string.match(rawId, "license:[%w]+") or rawId

    if type(idToDelete) == "string" and string.find(idToDelete, pureLicense) then
        MySQL.Async.execute('DELETE FROM users WHERE identifier = @id', {
            ['@id'] = idToDelete
        }, function()
            local notifyText = (Locales[Config.Locale or "fr"] and Locales[Config.Locale or "fr"]['char_deleted']) or "~g~Personnage supprimé."
            TriggerClientEvent('esx:showNotification', src, notifyText)
            Wait(500)
            sendCharacters(src)
        end)
    end
end)

RegisterNetEvent('niceliferp_system:createIdentity')
AddEventHandler('niceliferp_system:createIdentity', function(data)
    local src = source
    local slot = tostring(data.slot)
    local rawId = ESX.GetIdentifier(src)
    local pureLicense = string.match(rawId, "license:[%w]+") or rawId
    
    local newIdentifier = "char" .. slot .. ":" .. pureLicense
    local randomSSN = tostring(math.random(1000000, 9999999))
    
    -- On encode le skin envoyé par le client (tes vêtements)
    local skinStr = "{}"
    if data.skin then
        skinStr = json.encode(data.skin)
    end

    -- CORRECTION ICI : On insère la colonne `skin` dans la base de données !
    MySQL.Async.execute([[
        INSERT INTO users (identifier, firstname, lastname, dateofbirth, sex, height, ssn, nationality, placeofbirth, skin) 
        VALUES (@id, @fn, @ln, @dob, @sex, @height, @ssn, @nat, @pob, @skin)
        ON DUPLICATE KEY UPDATE 
        firstname = @fn, lastname = @ln, dateofbirth = @dob, sex = @sex, height = @height, nationality = @nat, placeofbirth = @pob, skin = @skin
    ]], {
        ['@id'] = newIdentifier,
        ['@fn'] = data.firstname,
        ['@ln'] = data.lastname,
        ['@dob'] = data.dateofbirth,
        ['@sex'] = (data.sex == "0" and "m" or "f"),
        ['@height'] = data.height,
        ['@ssn'] = randomSSN,
        ['@nat'] = data.nationality,
        ['@pob'] = data.placeofbirth,
        ['@skin'] = skinStr -- Le skin est enfin sauvegardé !
    }, function()
        Wait(100)
        TriggerEvent('esx:onPlayerJoined', src, "char" .. slot)
    end)
end)
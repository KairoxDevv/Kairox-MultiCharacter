local cam = nil
local spawnedPeds = {}
local isCreating = false
local inMulti = false
local awaitingSkinSave = false
local isNewToCity = false

local camPosMulti = vector3(411.5, -998.46, -98.3)
local centerPedMulti = vector3(408.95, -998.46, -98.3)

-- Configuration déplacée dans config.lua

local function cleanupPeds()
    for _, ped in ipairs(spawnedPeds) do
        if DoesEntityExist(ped) then DeleteEntity(ped) end
    end
    spawnedPeds = {}
end

CreateThread(function()
    while true do Wait(0)
        if inMulti or isCreating then ClearAreaOfPeds(409.0, -998.0, -99.0, 15.0, 1) else Wait(1000) end
    end
end)

CreateThread(function()
    while not NetworkIsPlayerActive(PlayerId()) do Wait(100) end
    ShutdownLoadingScreen()
    ShutdownLoadingScreenNui()
    Wait(500)
    TriggerServerEvent('niceliferp_system:requestCharacters')
end)

RegisterNetEvent('niceliferp_system:showMulticharacter')
AddEventHandler('niceliferp_system:showMulticharacter', function(characters)
    inMulti = true
    cleanupPeds()
    DoScreenFadeOut(500)
    Wait(500)

    DisplayRadar(false)
    TriggerEvent('esx:setHudVisibility', false)

    local playerPed = PlayerPedId()
    SetEntityCoords(playerPed, 409.0, -998.0, -105.0, false, false, false, false)
    SetEntityVisible(playerPed, false, false)
    Wait(500)

    cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
    SetCamCoord(cam, camPosMulti.x, camPosMulti.y, camPosMulti.z)
    PointCamAtCoord(cam, centerPedMulti.x, centerPedMulti.y, centerPedMulti.z)
    SetCamActive(cam, true)
    RenderScriptCams(true, false, 1, true, true)

    for _, pedData in ipairs(Config.PedPositions) do
        local slotChar = nil
        for _, c in pairs(characters) do
            if c.slot == pedData.slot then slotChar = c break end
        end

        if slotChar and slotChar.skin and slotChar.skin ~= "" and slotChar.skin ~= "{}" and slotChar.skin ~= "null" then
            local decodedSkin = json.decode(slotChar.skin)
            if type(decodedSkin) == "string" then decodedSkin = json.decode(decodedSkin) end
            
            local model = GetHashKey("mp_m_freemode_01")
            if decodedSkin and (decodedSkin.sex == 1 or decodedSkin.sex == "1") then 
                model = GetHashKey("mp_f_freemode_01") 
            end

            RequestModel(model)
            while not HasModelLoaded(model) do Wait(10) end
            
            local ped = CreatePed(4, model, pedData.coords.x, pedData.coords.y, pedData.coords.z, pedData.coords.w, false, false)
            
            FreezeEntityPosition(ped, true)
            SetBlockingOfNonTemporaryEvents(ped, true)
            TaskStandStill(ped, -1)
            
            -- ==============================================================
            -- LA METHODE FORTE NATIVE (Application forcée visage et vêtements)
            -- ==============================================================
            
            -- 1. Le Visage et la peau (Génétique)
            local dad = tonumber(decodedSkin.dad) or 0
            local mom = tonumber(decodedSkin.mom) or 0
            local face_weight = (tonumber(decodedSkin.face_md_weight) or 50) / 100.0
            local skin_weight = (tonumber(decodedSkin.skin_md_weight) or 50) / 100.0
            SetPedHeadBlendData(ped, dad, mom, 0, dad, mom, 0, face_weight, skin_weight, 0.0, false)

            -- 2. Les Cheveux
            SetPedComponentVariation(ped, 2, decodedSkin.hair_1 or 0, 0, 2)
            SetPedHairColor(ped, decodedSkin.hair_color_1 or 0, decodedSkin.hair_color_2 or 0)

            -- 3. Les Vêtements (Torse, T-shirt, Bras, Pantalon, Chaussures)
            SetPedComponentVariation(ped, 3, decodedSkin.arms or 0, decodedSkin.arms_2 or 0, 2)
            SetPedComponentVariation(ped, 4, decodedSkin.pants_1 or 0, decodedSkin.pants_2 or 0, 2)
            SetPedComponentVariation(ped, 6, decodedSkin.shoes_1 or 0, decodedSkin.shoes_2 or 0, 2)
            SetPedComponentVariation(ped, 8, decodedSkin.tshirt_1 or 15, decodedSkin.tshirt_2 or 0, 2)
            SetPedComponentVariation(ped, 11, decodedSkin.torso_1 or 15, decodedSkin.torso_2 or 0, 2)
            
            -- 4. On appelle quand même skinchanger en fond pour le maquillage/barbe
            TriggerEvent('skinchanger:loadPedSkin', ped, decodedSkin)
            -- ==============================================================

            table.insert(spawnedPeds, ped)
        end
    end

    DoScreenFadeIn(500)
    SetNuiFocus(true, true)
    
    local locale = Config.Locale or "fr"
    local translateDict = Locales[locale] or Locales['fr']
    SendNUIMessage({ action = "openMultichar", characters = characters, translateDict = translateDict })
end)

RegisterNUICallback('focusPed', function(data, cb)
    local slot = data.slot
    local targetCoords = nil

    for _, p in ipairs(Config.PedPositions) do
        if p.slot == slot then targetCoords = p.coords break end
    end

    if targetCoords then
        local newCam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
        SetCamCoord(newCam, targetCoords.x + 1.8, targetCoords.y, targetCoords.z + 1.4) 
        PointCamAtCoord(newCam, targetCoords.x, targetCoords.y, targetCoords.z + 0.9)
        
        SetCamActiveWithInterp(newCam, cam, 600, true, true)
        Wait(600)
        DestroyCam(cam, false)
        cam = newCam
    end
    cb('ok')
end)

RegisterNUICallback('startCreation', function(data, cb)
    inMulti = false
    isCreating = true
    cleanupPeds()
    DoScreenFadeOut(500)
    Wait(500)

    local playerPed = PlayerPedId()
    
    SetEntityCoords(playerPed, Config.Spawn.creationPos.x, Config.Spawn.creationPos.y, Config.Spawn.creationPos.z, false, false, false, false)
    SetEntityHeading(playerPed, Config.Spawn.creationPos.w)
    SetEntityVisible(playerPed, true, false)
    FreezeEntityPosition(playerPed, true)

    TriggerEvent('skinchanger:loadSkin', {sex = 0})

    -- Caméra initiale centrée (0.9m = milieu du corps)
    SetCamCoord(cam, Config.Spawn.creationPos.x, Config.Spawn.creationPos.y - 2.0, Config.Spawn.creationPos.z + 0.9)
    PointCamAtCoord(cam, Config.Spawn.creationPos.x, Config.Spawn.creationPos.y, Config.Spawn.creationPos.z + 0.9)

    Wait(500)
    DoScreenFadeIn(500)
    
    local maxVals = exports["skinchanger"]:GetMaxVals()
    local locale = Config.Locale or "fr"
    local translateDict = Locales[locale] or Locales['fr']
    SendNUIMessage({ action = "openCreation", maxVals = maxVals, translateDict = translateDict })
    cb('ok')
end)

RegisterNUICallback('focusCamera', function(data, cb)
    if isCreating then
        local px, py, pz = Config.Spawn.creationPos.x, Config.Spawn.creationPos.y, Config.Spawn.creationPos.z
        
        -- pz = -99.99
        if data.cam == "head" then
            SetCamCoord(cam, px, py - 0.8, pz + 1.65)
            PointCamAtCoord(cam, px, py, pz + 1.65)
        elseif data.cam == "torso" then
            SetCamCoord(cam, px, py - 1.2, pz + 1.1)
            PointCamAtCoord(cam, px, py, pz + 1.1)
        elseif data.cam == "legs" then
            SetCamCoord(cam, px, py - 1.2, pz + 0.3)
            PointCamAtCoord(cam, px, py, pz + 0.2)
        elseif data.cam == "body" then
            SetCamCoord(cam, px, py - 2.0, pz + 0.9)
            PointCamAtCoord(cam, px, py, pz + 0.9)
        end
    end
    cb('ok')
end)

RegisterNUICallback('rotatePed', function(data, cb)
    if isCreating then
        local ped = PlayerPedId()
        SetEntityHeading(ped, GetEntityHeading(ped) + data.degree)
    end
    cb('ok')
end)

RegisterNUICallback('updateSkin', function(data, cb)
    TriggerEvent('skinchanger:getSkin', function(skin)
        skin[data.key] = data.value
        TriggerEvent('skinchanger:loadSkin', skin)
    end)
    cb('ok')
end)

RegisterNUICallback('deleteCharacter', function(data, cb)
    TriggerServerEvent('niceliferp_system:deleteCharacter', data.id)
    cb('ok')
end)

RegisterNUICallback('finishCreation', function(data, cb)
    isNewToCity = (data.background == "new") 
    
    isCreating = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = "closeAll" })
    DoScreenFadeOut(500)
    Wait(500)

    RenderScriptCams(false, false, 0, true, true)
    DestroyCam(cam, false)

    TriggerEvent('skinchanger:getSkin', function(skin)
        data.skin = skin 
        awaitingSkinSave = true 
        TriggerServerEvent('niceliferp_system:createIdentity', data)
    end)

    cb('ok')
end)

RegisterNUICallback('playCharacter', function(data, cb)
    inMulti = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = "closeAll" })
    DoScreenFadeOut(500)
    Wait(500)
    
    cleanupPeds()
    RenderScriptCams(false, false, 0, true, true)
    DestroyCam(cam, false)
    
    TriggerServerEvent('niceliferp_system:loadCharacter', data.slot)
    cb('ok')
end)

RegisterNetEvent('esx:playerLoaded')
AddEventHandler('esx:playerLoaded', function(xPlayer, isNew, skin)
    inMulti = false
    isCreating = false

    if skin then
        TriggerEvent('skinchanger:loadSkin', skin)
    end

    Wait(200)

    if awaitingSkinSave then
        TriggerEvent('skinchanger:getSkin', function(actualSkin)
            TriggerServerEvent('esx_skin:save', actualSkin)
        end)
        
        if isNewToCity then
            TriggerEvent('niceliferp_taxi:startSequence')
        else
            SetEntityCoords(PlayerPedId(), Config.Spawn.airportSpawn.x, Config.Spawn.airportSpawn.y, Config.Spawn.airportSpawn.z, false, false, false, false)
            SetEntityHeading(PlayerPedId(), Config.Spawn.spawnHeading)
        end
        
        awaitingSkinSave = false
    else
        if xPlayer and xPlayer.coords then
            SetEntityCoords(PlayerPedId(), xPlayer.coords.x, xPlayer.coords.y, xPlayer.coords.z, false, false, false, false)
        end
    end

    FreezeEntityPosition(PlayerPedId(), false)
    SetEntityVisible(PlayerPedId(), true, false)
    
    TriggerEvent('esx:setHudVisibility', true)
    
    Wait(1500) 
    DoScreenFadeIn(1000) 
end)

RegisterCommand('setcreation', function()
    local playerPed = PlayerPedId()
    local coords = GetEntityCoords(playerPed)
    local heading = GetEntityHeading(playerPed)
    
    local textCoords = string.format("vector4(%.4f, %.4f, %.4f, %.4f)", coords.x, coords.y, coords.z, heading)
    
    print("^2[NiceLifeRP] ^0Coordonnées de Création : ^3" .. textCoords .. "^0")
    TriggerEvent('chat:addMessage', {
        color = {230, 0, 38},
        multiline = true,
        args = {"NiceLifeRP", "Coordonnées de création affichées dans la console F8 !"}
    })
end)
fx_version 'cerulean'
game 'gta5'

description 'NiceLifeRP - Multicharacter & Identity Ultime'
version '1.0.0'

shared_scripts { 
    '@es_extended/imports.lua',
    'config.lua',
    'locales/fr.lua',
    'locales/en.lua'
}
client_scripts { 'client.lua' }
server_scripts { '@mysql-async/lib/MySQL.lua', 'server.lua' }
ui_page 'html/index.html'
files { 'html/index.html', 'html/style.css', 'html/script.js' }
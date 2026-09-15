param(
    [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin",
    [string]$Database = "geobrasil",
    [string]$HostName = "localhost",
    [int]$Port = 5434,
    [string]$User = "postgres",
    [string]$DataDir = "data",
    [string]$ExtractDir = "data\extracted\ibge",
    [switch]$ImportSectors
)

$ErrorActionPreference = "Stop"

$psql = Join-Path $PgBin "psql.exe"
$shp2pgsql = Join-Path $PgBin "shp2pgsql.exe"

function Expand-IbgeZip {
    param(
        [string]$ZipFile,
        [string]$Destination
    )

    $sevenZip = Get-Command 7z.exe -ErrorAction SilentlyContinue
    if (-not $sevenZip -and (Test-Path "C:\Program Files\7-Zip\7z.exe")) {
        $sevenZip = Get-Item "C:\Program Files\7-Zip\7z.exe"
    }

    if ($sevenZip) {
        & $sevenZip.Source x $ZipFile "-o$Destination" -y
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao extrair $ZipFile com 7-Zip."
        }
        return
    }

    if (Get-Command tar.exe -ErrorAction SilentlyContinue) {
        & tar.exe -xf $ZipFile -C $Destination
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao extrair $ZipFile com tar.exe. Instale o 7-Zip para arquivos ZIP Deflate64 do IBGE."
        }
        return
    }

    Expand-Archive -Force $ZipFile $Destination
}

function Invoke-NativeShpImport {
    param(
        [string]$Shapefile,
        [string]$TableName
    )

    $command = '"{0}" -d -D -I -s 4674 -W UTF-8 "{1}" {2} | "{3}" -h {4} -p {5} -U {6} -d {7}' -f `
        $shp2pgsql,
        $Shapefile,
        $TableName,
        $psql,
        $HostName,
        $Port,
        $User,
        $Database

    & cmd.exe /c $command

    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao importar $Shapefile para $TableName."
    }
}

New-Item -ItemType Directory -Force -Path $ExtractDir | Out-Null

Expand-IbgeZip (Join-Path $DataDir "BR_UF_2025.zip") $ExtractDir
Expand-IbgeZip (Join-Path $DataDir "BR_Municipios_2025.zip") $ExtractDir

Invoke-NativeShpImport (Join-Path $ExtractDir "BR_UF_2025.shp") "staging_ibge_states"

Invoke-NativeShpImport (Join-Path $ExtractDir "BR_Municipios_2025.shp") "staging_ibge_municipalities"

& $psql -h $HostName -p $Port -U $User -d $Database -f "database\004_import_ibge_from_staging.sql"

if ($ImportSectors) {
    Expand-IbgeZip (Join-Path $DataDir "BR_setores_CD2022.zip") $ExtractDir

    Invoke-NativeShpImport (Join-Path $ExtractDir "BR_setores_CD2022.shp") "staging_ibge_census_sectors"

    & $psql -h $HostName -p $Port -U $User -d $Database -f "database\006_import_census_sectors_from_staging.sql"
}

& $psql -h $HostName -p $Port -U $User -d $Database -f "database\005_validate_spatial_import.sql"

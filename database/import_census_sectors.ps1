param(
    [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin",
    [string]$Database = "geobrasil",
    [string]$HostName = "localhost",
    [int]$Port = 5434,
    [string]$User = "postgres",
    [string]$DataDir = "data",
    [string]$ExtractDir = "data\extracted\ibge"
)

$ErrorActionPreference = "Stop"

$psql = Join-Path $PgBin "psql.exe"
$shp2pgsql = Join-Path $PgBin "shp2pgsql.exe"
$sectorZip = Join-Path $DataDir "BR_setores_CD2022.zip"
$sectorShp = Join-Path $ExtractDir "BR_setores_CD2022.shp"
$sectorShx = Join-Path $ExtractDir "BR_setores_CD2022.shx"
$sectorDbf = Join-Path $ExtractDir "BR_setores_CD2022.dbf"
$sectorPrj = Join-Path $ExtractDir "BR_setores_CD2022.prj"

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

function Test-SectorFiles {
    if (-not ((Test-Path $sectorShp) -and (Test-Path $sectorShx) -and (Test-Path $sectorDbf) -and (Test-Path $sectorPrj))) {
        return $false
    }

    $shpSize = (Get-Item $sectorShp).Length
    $shxSize = (Get-Item $sectorShx).Length
    $dbfSize = (Get-Item $sectorDbf).Length
    $prjSize = (Get-Item $sectorPrj).Length

    return ($shpSize -gt 1200000000 -and $dbfSize -gt 1000000000 -and $shxSize -gt 3000000 -and $prjSize -gt 0)
}

function Assert-StagingTableCreated {
    $stagingExists = & $psql -h $HostName -p $Port -U $User -d $Database -tAc "SELECT to_regclass('public.staging_ibge_census_sectors') IS NOT NULL;"

    if ($stagingExists.Trim() -ne "t") {
        throw "A tabela staging_ibge_census_sectors nao foi criada. O shp2pgsql falhou ao ler a malha de setores. Reextraia BR_setores_CD2022.zip com 7-Zip e tente novamente."
    }
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

if (-not (Test-SectorFiles)) {
    Remove-Item -Force -ErrorAction SilentlyContinue $sectorShp, $sectorShx, $sectorDbf, $sectorPrj
    Expand-IbgeZip $sectorZip $ExtractDir
}

if (-not (Test-SectorFiles)) {
    throw "Arquivos da malha de setores ausentes, incompletos ou corrompidos. Extraia data\BR_setores_CD2022.zip com 7-Zip para data\extracted\ibge e tente novamente."
}

& $psql -h $HostName -p $Port -U $User -d $Database -f "database\003_census_sectors.sql"

Invoke-NativeShpImport $sectorShp "staging_ibge_census_sectors"

Assert-StagingTableCreated

& $psql -h $HostName -p $Port -U $User -d $Database -f "database\006_import_census_sectors_from_staging.sql"

& $psql -h $HostName -p $Port -U $User -d $Database -f "database\005_validate_spatial_import.sql"

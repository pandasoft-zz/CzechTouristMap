<?xml-stylesheet type="text/xsl"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://mapsforge.org/renderTheme" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<!-- 
# OpenHikingMap
#
# Facility polygons
#
# Copyright (c) 2022-2023 OpenHiking contributors
# SPDX-License-Identifier: GPL-3.0-only
-->


<xsl:template name="poly-facilities">

  <!-- DO 7-->

<!-- Commercial/industrial — SM5: manipulation area 240,240,240 = #F0F0F0 -->
<rule e="way" k="landuse" v="commercial">
  <area fill="#F5EFEA" scale="none"/>
  <rule e="way" k="*" v="*" zoom-min="16">
    <caption k="name" font-style="italic" font-family="sans_serif" font-size="12" fill="#000000" stroke="#FFFFFF" stroke-width="1.7" />
  </rule>
</rule>

<!-- Industrial — SM5: manipulation/storage area 240,240,240 = #F0F0F0 -->
<rule e="way" k="landuse" v="industrial">
  <area fill="#E5E5E0" scale="none"/>
  <rule e="way" k="*" v="*" zoom-min="16">
    <caption k="name" font-style="italic" font-family="sans_serif" font-size="12" fill="#000000" stroke="#FFFFFF" stroke-width="1.7" />
  </rule>
</rule>

<rule e="way" k="landuse" v="landfill">
  <area fill="#D3D39A" scale="none"/>
</rule>

<rule e="way" k="landuse" v="brownfield|construction">
<area fill="#e7debc" scale="none"/>
  <rule e="way" k="*" v="*" zoom-min="16">
    <caption k="name" font-style="italic" font-family="sans_serif" font-size="12" fill="#000000" stroke="#FFFFFF" stroke-width="1.7" />
  </rule>
</rule>


<!-- Parks/gardens — light green, Czech map style; SM5 garden fill = 245,255,219 = #F5FFDB -->
<!-- Note: no stroke — parks can be large polygons spanning many tiles; stroke causes tile-boundary artifacts -->
<rule e="way" k="leisure" v="common|village_green|park|garden">
  <area fill="#E2F0CB" scale="none"/>
  <rule e="way" k="*" v="*" zoom-max="14">
    <area src="{$patternPath}/park.svg" symbol-height="20"/>
  </rule>
  <rule e="way" k="*" v="*" zoom-min="15">
    <area src="{$patternPath}/park.svg" symbol-height="30"/>
  </rule>
  <rule e="way" k="garden:type" v="~" zoom-min="16">
    <caption k="name" font-style="italic" font-family="sans_serif" font-size="12" fill="#000000" stroke="#FFFFFF" stroke-width="1.7" />
  </rule>
</rule>


<rule e="way" k="landuse" v="recreation_ground">
    <area fill="#E2F0CB" scale="none"/>
  <rule e="way" k="*" v="*" zoom-max="14">
    <area src="file:/patterns/park.svg" symbol-height="20"/>
  </rule>
  <rule e="way" k="*" v="*" zoom-min="15">
    <area src="file:/patterns/park.svg" symbol-height="30"/>
  </rule>
  <rule e="way" k="*" v="*" zoom-min="16">
    <caption k="name" font-style="italic" font-family="sans_serif" font-size="12" fill="#000000" stroke="#FFFFFF" stroke-width="1.7" />
  </rule>
</rule>


<rule e="way" k="leisure" v="sports_centre" closed="yes">
  <area fill="#e4ecc7" scale="none"/>
</rule>

<rule e="way" k="leisure" v="water_park" closed="yes">
  <area fill="#b8dae8" scale="none"/>
</rule>

<rule e="way" k="amenity" v="public_bath" closed="yes">
  <area fill="#b8dae8" scale="none"/>
</rule>


<!-- Camp site — clear green with visible border -->
<rule e="way" k="tourism" v="camp_site" closed="yes">
    <area fill="#EBF8D0" stroke="#207830" stroke-width="0.5" scale="none"/>
</rule>


<rule e="way" k="landuse" v="retail">
  <area fill="#F5EFEA" />
  <rule e="way" k="*" v="*" zoom-min="16">
    <caption k="name" font-style="italic" font-family="sans_serif" font-size="12" fill="#000000" stroke="#FFFFFF" stroke-width="1.7" />
  </rule>
</rule>

<rule e="way" k="landuse" v="railway">
  <area fill="#D8CAC8" />
</rule>


<rule e="way" k="landuse" v="plant_nursery">
  <area fill="#AEDFA3" />
</rule>

<rule e="way" k="landuse" v="greenhouse_horticulture">
  <area fill="#ECF1B8" />
</rule>

<rule e="way" k="building" v="~" >
  <rule e="way" k="power" v="plant">
    <rule e="way" k="plant:source" v="solar">
      <area fill="#7ABFC2" />
    </rule>
  </rule>
  <rule e="way" k="power" v="generator">
    <rule e="way" k="generator:source" v="solar">
      <area fill="#7ABFC2" />
    </rule>
  </rule>

  <rule e="way" k="man_made" v="wastewater_plant" closed="yes">
    <area fill="#D5D5D5" />
  </rule>

  <!-- Airport/aerodrome — mapy.cz: same as farmland off-white -->
  <rule e="way" k="aeroway" v="airport|aerodrome|apron|helipad|terminal" closed="yes">
    <area fill="#f0efe4" />
  </rule>

  <rule e="way" k="amenity" v="childcare|kindergarten|school" closed="yes">
    <area fill="#ccc2b1" stroke="#A09080" stroke-width="1" scale="none"/>
  </rule>

  <rule e="way" k="amenity" v="townhall|government" closed="yes">
    <area fill="#ccc2b1" stroke="#A09080" stroke-width="1" scale="none"/>
  </rule>

  <rule e="way" k="amenity" v="hospital|clinic" closed="yes">
    <area fill="#ccc2b1" stroke="#A09080" stroke-width="1" scale="none"/>
  </rule>


  <rule e="way" k="amenity" v="prison" closed="yes">
    <rule e="any" k="*" v="*" zoom-max="14">
      <area stroke="#E6E6E6" stroke-width="2" scale="none" src="{$patternPath}/prison.svg" symbol-height="20"/>  
    </rule>
    <rule e="any" k="*" v="*" zoom-min="15">
      <area stroke="#E6E6E6" stroke-width="2" scale="none" src="{$patternPath}/prison.svg" symbol-height="40"/>  
    </rule>
  </rule>
</rule>  


  <!-- DO 8-->
<rule e="way" k="power" v="plant">
  <rule e="way" k="plant:source" v="solar">
    <area fill="#7ABFC2" />
    <rule e="any" k="*" v="*"  zoom-max="15">
      <area stroke="#C5C5C5" stroke-width="2" scale="none" src="{$patternPath}/solar.svg" symbol-height="32"/>
    </rule>
    <rule e="any" k="*" v="*"  zoom-min="16">
      <area stroke="#C5C5C5" stroke-width="2" scale="none" src="{$patternPath}/solar.svg" symbol-height="48"/>
    </rule>
  </rule>    
</rule>

<rule e="way" k="power" v="generator">
  <rule e="way" k="generator:source" v="solar">
    <area fill="#7ABFC2" />
    <rule e="any" k="*" v="*"  zoom-max="15">
      <area stroke="#C5C5C5" stroke-width="2" scale="none" src="{$patternPath}/solar.svg" symbol-height="32"/>
    </rule>
    <rule e="any" k="*" v="*"  zoom-min="16">
      <area stroke="#C5C5C5" stroke-width="2" scale="none" src="{$patternPath}/solar.svg" symbol-height="48"/>
    </rule>
  </rule>
</rule>


<rule  e="way" k="landuse" v="military">
  <rule e="any" k="*" v="*" zoom-min="13" zoom-max="14">
    <area stroke="#F89696" stroke-width="2" scale="none" src="{$patternPath}/military.svg" symbol-height="20"/>
  </rule>
  <rule e="any" k="*" v="*" zoom-min="15">
    <area stroke="#F89696" stroke-width="2" scale="none" src="{$patternPath}/military.svg" symbol-height="40"/>
  </rule>
</rule>

  <!-- Cemetery — light green with gray border per Czech map convention -->
  <rule e="way" k="landuse" v="cemetery">
    <area fill="#C0E4A8" stroke="#B0B0B0" stroke-width="0.8" scale="none"/>
    <rule e="any" k="*" v="*" zoom-max="15">
      <rule e="any" k="religion" v="christian">
        <area src="file:/patterns/cemetery.svg" symbol-scaling="size" symbol-height="32" />
      </rule>
      <rule e="any" k="religion" v="jewish">
        <area src="file:/patterns/cemetery2.svg" symbol-scaling="size" symbol-height="32" />
      </rule>
      <rule e="any" k="religion" v="~">
        <area src="file:/patterns/cemetery.svg" symbol-scaling="size" symbol-height="32" />
      </rule>
    </rule>
    <rule e="any" k="*" v="*" zoom-min="16">
      <rule e="any" k="religion" v="christian">
        <area src="file:/patterns/cemetery.svg" symbol-scaling="size" symbol-height="64" />
      </rule>
      <rule e="any" k="religion" v="jewish">
        <area src="file:/patterns/cemetery2.svg" symbol-scaling="size" symbol-height="64" />
      </rule>
      <rule e="any" k="religion" v="~">
        <area src="file:/patterns/cemetery.svg" symbol-scaling="size" symbol-height="64" />
      </rule>
    </rule>
    <rule e="way" k="*" v="*" zoom-min="16">
      <caption k="name" font-style="italic" font-family="sans_serif" font-size="12" fill="#000000" stroke="#FFFFFF" stroke-width="1.7" />
    </rule>
  </rule>

<rule e="way" k="leisure" v="beach_resort" closed="yes">
  <area fill="#7BFF8B" scale="none"/>
</rule>


  <rule e="way" k="leisure" v="playground" closed="yes">
    <area fill="#FDF0D5" />
  </rule>

<!-- Parking — SM5: ostatní komunikace fill 245,245,245 = #F5F5F5 -->
<rule e="way" k="amenity" v="parking" zoom-min="15">
    <area fill="#F0E8D0" stroke="#D0C8A0" stroke-width="1" scale="none" />
</rule>


<rule e="way" k="man_made" v="pier" closed="yes">
    <area fill="#ddd340" />
</rule>

<rule e="way" k="waterway" v="dock">
    <area fill="#b5d6f1"/>
</rule>


</xsl:template>
</xsl:stylesheet>
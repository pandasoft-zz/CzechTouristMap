<?xml-stylesheet type="text/xsl"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://mapsforge.org/renderTheme" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<!-- 
# OpenHikingMap
#
# Landuse polygons
#
# Copyright (c) 2022-2023 OpenHiking contributors
# SPDX-License-Identifier: GPL-3.0-only
-->


<xsl:template name="poly-landuse">


<!-- Land cover colors — ČÚZK SM5 standard adapted for tourist map scale -->
<!-- SM5: sea=#8CC5FF, forest=235,255,178=#EBFFB2, grassland=255,255,234=#FFFFEA, farmland=255,255,230 -->
<rule e="way" k="natural" v="sea">
  <area fill="#8CC5FF"/>
</rule>

<!-- Land background — slightly warm off-white, Czech map style -->
<rule e="way" k="natural" v="land|nosea">
  <area fill="#FDFDF0"/>
</rule>

<!-- Farmland — very light warm yellow per SM5 (255,255,230) -->
<rule e="way" k="landuse" v="field|farm|farmland">
  <area fill="#FFFFE6"/>
</rule>

<!-- Residential areas — warm beige (SM5-ish, Czech maps show settlement as warm tone) -->
<rule e="way" k="landuse" v="residential">
  <area fill="#F0D8B0" stroke="#C8B080" stroke-width="0.2" scale="none" />
</rule>
<rule e="way" k="landuse" v="garages">
  <area fill="#F0D8B0" stroke="#C8B080" stroke-width="0.2" scale="none" />
</rule>

<!-- Forest broadleaf — SM5: 235,255,178=#EBFFB2, Czech tourist map: slightly more saturated -->
<rule e="way" k="landuse" v="forest" >
  <rule e="way" k="leaf_type" v="~|broadleaved" >
    <area fill="#C8E8A0"/>
  </rule>
</rule>

<rule e="way" k="natural" v="wood"  >
  <rule e="way" k="leaf_type" v="~|broadleaved" >
    <area fill="#C8E8A0"/>
  </rule>
</rule>

<!-- Meadow/grassland — SM5: 255,255,234=#FFFFEA, Czech tourist map: light yellow-green -->
<rule e="way" k="landuse" v="meadow">
  <area fill="#E4F5C0" scale="none"/>
</rule>

<rule e="way" k="natural|landuse" v="grass|grassland">
  <area fill="#E4F5C0" scale="none"/>
</rule>

<rule e="way" k="tourism" v="zoo" closed="yes">
  <area fill="#CFFF9E" stroke="#1f7d18" stroke-width="1" scale="none"/>
  <rule e="way" k="*" v="*" zoom-max="14">
    <area src="file:/patterns/zoo.svg" symbol-height="20"/>
  </rule>
  <rule e="way" k="*" v="*" zoom-min="15">
    <area src="file:/patterns/zoo.svg" symbol-height="30"/>
  </rule>  
  <rule e="way" k="*" v="*" zoom-min="16">
    <caption k="name" font-style="italic" font-family="sans_serif" font-size="12" fill="#000000" stroke="#FFFFFF" stroke-width="1.7" />
  </rule>
</rule>


<!-- Forest needleleaf — slightly darker/cooler green to distinguish from broadleaf -->
<rule e="way" k="landuse" v="forest" >
  <rule e="way" k="leaf_type" v="needleleaved" >
    <area fill="#A8D880"/>
  </rule>
</rule>

<rule e="way" k="natural" v="wood" >
  <rule e="way" k="leaf_type" v="needleleaved" >
    <area fill="#A8D880"/>
  </rule>
</rule>


<!-- Beach/sand — pale yellow -->
<rule e="way" k="natural" v="beach">
  <area fill="#F5F0A0" scale="none"/>
</rule>


<!-- Orchard/vineyard — SM5: 245,255,219 = #F5FFDB (garden/orchard fill) -->
<rule e="way" k="landuse" v="orchard">
    <area fill="#E8F8C0"/>
    <rule e="way" k="*" v="*" zoom-max="14">
      <area src="file:/patterns/orchard.svg" symbol-height="16"/>
    </rule>
    <rule e="way" k="*" v="*" zoom-min="15">
      <area src="file:/patterns/orchard.svg" symbol-height="20"/>
  </rule>
</rule>


<!-- Scrub — light yellow-green -->
<rule  e="way" k="natural" v="scrub">
  <area fill="#D8F0A8" scale="none" />   
  <rule e="any" k="*" v="*">
    <rule e="way" k="*" v="*" zoom-max="14">
      <area src="file:/patterns/scrub.svg" symbol-height="28"/>
    </rule>
    <rule e="way" k="*" v="*" zoom-min="15">
      <area src="file:/patterns/scrub.svg" symbol-height="42"/>
    </rule>
  </rule>
</rule>

<rule e="way" k="natural" v="sand">
  <area fill="#F8F898" scale="none"/>
    <rule e="way" k="*" v="*" zoom-min="14" zoom-max="16">
      <area src="{$patternPath}/sand.svg" symbol-height="16"/>
    </rule>
    <rule e="way" k="*" v="*" zoom-min="17">
      <area src="{$patternPath}/sand.svg" symbol-height="22"/>
  </rule>
</rule>

<!-- Farmyard — slightly warm tan -->
<rule e="way" k="landuse" v="farmyard">
  <area fill="#D8D4A8"/>
</rule>

<!-- Vineyard — SM5: 245,255,219 same as garden -->
<rule e="way" k="landuse" v="vineyard">
  <area fill="#E8F8C0"/>
  <rule e="way" k="*" v="*" zoom-max="14">
    <area src="file:/patterns/vineyard.svg" symbol-height="20"/>
  </rule>
  <rule e="way" k="*" v="*" zoom-min="15">
    <area src="file:/patterns/vineyard.svg" symbol-height="30"/>
  </rule>
</rule>

<rule e="way" k="landuse" v="allotments">
  <area fill="#80FFF8C5" />
</rule>

<!-- Heath — light yellow-green tint -->
<rule  e="way" k="natural" v="heath">
    <area fill="#EAF5A8" scale="none"/>
</rule>

<!-- Fell/alpine meadow — very light green -->
<rule  e="way" k="natural" v="fell">
    <area fill="#E8F5E0" scale="none"/>
</rule>


<!-- Scree/shingle/bare rock — SM5: rocky terrain uses ochre/brown tones -->
<rule  e="way" k="natural" v="scree">
  <area fill="#E8E4DC" scale="none"/>
  <rule e="way" k="*" v="*" zoom-max="14">
    <area src="file:/patterns/scree.svg" symbol-height="14"/>
  </rule>
  <rule e="way" k="*" v="*" zoom-min="15">
    <area src="file:/patterns/scree.svg" symbol-height="18"/>
  </rule>
</rule>

<rule  e="way" k="natural" v="shingle">
  <area fill="#E0DCD8" scale="none"/>
  <rule e="way" k="*" v="*" zoom-max="12">
    <area src="file:/patterns/shingle.svg" symbol-height="14"/>
  </rule>
  <rule e="way" k="*" v="*" zoom-min="13" zoom-max="14">
    <area src="file:/patterns/shingle.svg" symbol-height="18"/>
  </rule>
  <rule e="way" k="*" v="*" zoom-min="15">
    <area src="file:/patterns/shingle.svg" symbol-height="25"/>
  </rule>
</rule>


<rule  e="way" k="natural" v="bare_rock">
  <area fill="#E0DCD8" scale="none"/>
  <rule e="way" k="*" v="*" zoom-max="15">
    <area src="file:/patterns/bare_rock.svg" symbol-height="18"/>
  </rule>
  <rule e="way" k="*" v="*" zoom-min="16">
    <area src="file:/patterns/bare_rock.svg" symbol-height="32"/>
  </rule>
</rule>

<rule  e="way" k="geological" v="volcanic_lava_field">
  <area fill="#E0E4E0" scale="none"/>
  <rule e="way" k="*" v="*" zoom-max="15">
    <area src="file:/patterns/lava_field.svg"   />
  </rule>
  <rule e="way" k="*" v="*" zoom-min="16">
    <area src="file:/patterns/lava_field.svg" />
  </rule>
</rule>

<rule e="way" k="natural" v="mud">
  <area fill="#AEAE97" scale="none"/>
</rule>


<rule e="way" k="landuse" v="quarry">
  <area fill="#E0E4E0"/>
  <rule e="way" k="*" v="*" zoom-max="15">
    <area src="file:/patterns/quarry.svg" symbol-height="32"/>
  </rule>
  <rule e="way" k="*" v="*" zoom-min="16">
    <area src="file:/patterns/quarry.svg" symbol-height="48"/>
  </rule>
</rule>

  
</xsl:template>
</xsl:stylesheet>
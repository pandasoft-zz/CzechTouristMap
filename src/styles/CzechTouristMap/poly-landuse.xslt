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
<!-- SM5: sea=#B0D8FF, forest=235,255,178=#EBFFB2, grassland=255,255,234=#FFFFEA, farmland=255,255,230 -->
<rule e="way" k="natural" v="sea">
  <area fill="#B0D8FF"/>
</rule>

<!-- Land background — warm cream, mapy.cz style -->
<rule e="way" k="natural" v="land|nosea">
  <area fill="#F7F5EE"/>
</rule>

<!-- Farmland — mapy.cz: very light warm off-white -->
<rule e="way" k="landuse" v="field|farm|farmland">
  <area fill="#F5F4EC"/>
</rule>

<!-- Residential areas — mapy.cz: warm tan -->
<rule e="way" k="landuse" v="residential">
  <area fill="#E2E0DC" stroke="#B0A898" stroke-width="0.2" scale="none" />
</rule>
<rule e="way" k="landuse" v="garages">
  <area fill="#E2E0DC" stroke="#B0A898" stroke-width="0.2" scale="none" />
</rule>

<!-- Forest broadleaf — mapy.cz: rgb(205,224,177) = #D8E8C4 -->
<rule e="way" k="landuse" v="forest" >
  <rule e="way" k="leaf_type" v="~|broadleaved" >
    <area fill="#D8E8C4"/>
  </rule>
</rule>

<rule e="way" k="natural" v="wood"  >
  <rule e="way" k="leaf_type" v="~|broadleaved" >
    <area fill="#D8E8C4"/>
  </rule>
</rule>

<!-- Meadow/grassland — mapy.cz: light yellow-green -->
<rule e="way" k="landuse" v="meadow">
  <area fill="#EBF8D0" scale="none"/>
</rule>

<rule e="way" k="natural|landuse" v="grass|grassland">
  <area fill="#EBF8D0" scale="none"/>
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
    <area fill="#AACF88"/>
  </rule>
</rule>

<rule e="way" k="natural" v="wood" >
  <rule e="way" k="leaf_type" v="needleleaved" >
    <area fill="#AACF88"/>
  </rule>
</rule>


<!-- Beach/sand — pale yellow -->
<rule e="way" k="natural" v="beach">
  <area fill="#F7F3BC" scale="none"/>
</rule>


<!-- Orchard — mapy.cz: #EBF2D0 fill, circles with #ccd8a0 outline -->
<rule e="way" k="landuse" v="orchard">
    <area fill="#EBF2D0"/>
    <rule e="way" k="*" v="*" zoom-max="14">
      <area src="file:/patterns/orchard.svg" symbol-height="16"/>
    </rule>
    <rule e="way" k="*" v="*" zoom-min="15">
      <area src="file:/patterns/orchard.svg" symbol-height="20"/>
  </rule>
</rule>


<!-- Scrub — light yellow-green -->
<rule  e="way" k="natural" v="scrub">
  <area fill="#E2F4C0" scale="none" />   
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
  <area fill="#E4E0C0"/>
</rule>

<!-- Vineyard — SM5: 245,255,219 same as garden -->
<rule e="way" k="landuse" v="vineyard">
  <area fill="#EFF9D0"/>
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
    <area fill="#F0F7C0" scale="none"/>
</rule>

<!-- Fell/alpine meadow — very light green -->
<rule  e="way" k="natural" v="fell">
    <area fill="#EFF8EA" scale="none"/>
</rule>


<!-- Scree/shingle/bare rock — SM5: rocky terrain uses ochre/brown tones -->
<rule  e="way" k="natural" v="scree">
  <area fill="#EDEAE4" scale="none"/>
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
  <area fill="#EAECEC" scale="none"/>
  <rule e="way" k="*" v="*" zoom-max="15">
    <area src="file:/patterns/lava_field.svg"   />
  </rule>
  <rule e="way" k="*" v="*" zoom-min="16">
    <area src="file:/patterns/lava_field.svg" />
  </rule>
</rule>

<rule e="way" k="natural" v="mud">
  <area fill="#C4C4B0" scale="none"/>
</rule>


<rule e="way" k="landuse" v="quarry">
  <area fill="#EAECEC"/>
  <rule e="way" k="*" v="*" zoom-max="15">
    <area src="file:/patterns/quarry.svg" symbol-height="32"/>
  </rule>
  <rule e="way" k="*" v="*" zoom-min="16">
    <area src="file:/patterns/quarry.svg" symbol-height="48"/>
  </rule>
</rule>

  
</xsl:template>
</xsl:stylesheet>
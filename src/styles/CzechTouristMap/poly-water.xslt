<?xml-stylesheet type="text/xsl"?>
<!-- 
# OpenHikingMap
#
# Copyright (c) 2022-2024 OpenHiking contributors
# SPDX-License-Identifier: GPL-3.0-only
-->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://mapsforge.org/renderTheme" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<!-- Water colors — based on ČÚZK SM5: fill 224,255,255 (#E0FFFF), adapted to Czech tourist map style -->
<xsl:variable name="wetland-color">#C0E8E0</xsl:variable>
<xsl:template name="poly-water">

<!-- Glacier — very pale blue-white -->
<rule e="way" k="natural" v="glacier">
  <area fill="#E0F4FF" scale="none"/>
</rule>


<!-- Water bodies — SM5 standard: #E0FFFF (224,255,255 light cyan) -->
<rule e="way" k="natural" v="water">
    <area fill="#E0FFFF"/>
    <rule e="way" k="tidal" v="yes">
        <area fill="#E0FFFF"/>
    </rule>
</rule>

<rule e="way" k="landuse" v="reservoir|basin">
    <area fill="#E0FFFF"/>
</rule>

<rule  e="way" k="waterway" v="riverbank">
    <area fill="#E0FFFF"/>
</rule>

<!-- Wetlands -->
<rule e="way" k="natural" v="wetland">
  <rule e="way" k="wetland" v="reedbed">
      <area fill="{$wetland-color}"/>
      <rule e="way" k="*" v="*" zoom-max="12">
        <area src="{$patternPath}/reedbed.svg" symbol-height="16"/>
      </rule>
      <rule e="way" k="*" v="*" zoom-min="13" zoom-max="14">
        <area src="{$patternPath}/reedbed.svg" symbol-height="24"/>
      </rule>
      <rule e="way" k="*" v="*" zoom-min="15">
        <area src="{$patternPath}/reedbed.svg" symbol-height="32"/>
      </rule>
  </rule>
  <rule e="way" k="wetland" v="swamp">
      <area fill="#B0D890"/>
      <rule e="way" k="*" v="*" zoom-max="15">
        <area src="{$patternPath}/swamp.svg" symbol-height="16"/>
      </rule>
      <rule e="way" k="*" v="*" zoom-min="16">
        <area src="{$patternPath}/swamp.svg" symbol-height="32"/>
      </rule>
  </rule>
  <rule e="way" k="wetland" v="tidalflat">
      <area fill="#B8FCF8"/>  
      <rule e="way" k="*" v="*" zoom-max="15">
        <area src="{$patternPath}/tidalflat.svg" symbol-height="16"/>
      </rule>
      <rule e="way" k="*" v="*" zoom-min="16">
        <area src="{$patternPath}/tidalflat.svg" symbol-height="32"/>
      </rule>
  </rule>
  <rule e="way" k="wetland" v="~">
      <area fill="{$wetland-color}"/> 
      <rule e="way" k="*" v="*" zoom-max="15">
        <area src="{$patternPath}/wetland.svg" symbol-height="16"/>
      </rule>
      <rule e="way" k="*" v="*" zoom-min="16">
        <area src="{$patternPath}/wetland.svg" symbol-height="32"/>
      </rule>
  </rule>
</rule>

<rule e="way" k="natural" v="marsh">
  <rule cat="all" e="way" k="*" v="*">
      <area fill="{$wetland-color}"/>    
      <area src="{$patternPath}/wetland.svg" symbol-height="30"/>
  </rule>
</rule>


</xsl:template>
</xsl:stylesheet>
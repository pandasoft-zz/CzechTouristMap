<?xml-stylesheet type="text/xsl"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://mapsforge.org/renderTheme" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

<xsl:template name="lines-contours">

<!-- Contour lines — warm brown per ČÚZK SM5 standard (245,190,64 = #F5BE40 base, darkened for legibility) -->
<rule cat="contours" e="way" k="contour_ext" v="*">
  <!-- Major contours (každá 5. / index) — stronger warm brown -->
  <rule e="way" k="contour_ext" v="elevation_major" zoom-min="10" zoom-max="12">
    <line stroke="#C07030" stroke-width="0.45" stroke-linecap="butt" scale="none"/>
  </rule>
  <rule e="way" k="contour_ext" v="elevation_major" zoom-min="13">
    <line stroke="#C07030" stroke-width="0.7" stroke-linecap="butt" scale="none"/>
  </rule>
  <!-- Medium contours — mid brown -->
  <rule e="way" k="contour_ext" v="elevation_medium" zoom-min="11" zoom-max="12">
    <line stroke="#D09060" stroke-width="0.3" stroke-linecap="butt" scale="none"/>
  </rule>
  <rule e="way" k="contour_ext" v="elevation_medium" zoom-min="13">
    <line stroke="#D09060" stroke-width="0.5" stroke-linecap="butt" scale="none"/>
  </rule>
  <!-- Minor/auxiliary contours — light warm brown, semi-transparent -->
  <rule e="way" k="contour_ext" v="elevation_minor" zoom-min="14">
    <line stroke="#80E0B080" stroke-width="0.3" stroke-linecap="butt" scale="none"/>
  </rule>
  <!-- Elevation labels — warm brown, sans-serif bold, matching SM5 convention -->
  <rule e="way" k="contour_ext" v="elevation_major" zoom-min="13" zoom-max="15">
    <pathText k="ele" font-size="8" font-style="bold" fill="#8B5818" stroke="#FFFFFF" stroke-width="1" repeat="true" repeat-gap="250" priority="{$pr-label-contour-ele}"/>
  </rule>
  <rule e="way" k="contour_ext" v="elevation_major|elevation_medium" zoom-min="16" zoom-max="16">
    <pathText k="ele" font-size="9" font-style="bold" fill="#8B5818" stroke="#FFFFFF" stroke-width="1.2" repeat="true" repeat-gap="250" priority="{$pr-label-contour-ele}"/>
  </rule>
  <rule e="way" k="contour_ext" v="elevation_major|elevation_medium" zoom-min="17">
    <pathText k="ele" font-size="10" font-style="bold" fill="#8B5818" stroke="#FFFFFF" stroke-width="1.3" repeat="true" repeat-gap="300" priority="{$pr-label-contour-ele}"/>
  </rule>
</rule>


</xsl:template>
</xsl:stylesheet>
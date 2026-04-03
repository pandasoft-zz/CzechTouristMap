<?xml-stylesheet type="text/xsl"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://mapsforge.org/renderTheme" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<!--
# OpenHikingMap
#
# Hiking trail highlights
#
# Copyright (c) 2022-2023 OpenHiking contributors
# SPDX-License-Identifier: GPL-3.0-only
-->


<xsl:template name="lines-hiking-trails">

<!-- OpenAndroMaps encodes trail color as osmc_color=wmco_<color> on ways.
     hknetwork=rwn/lwn/nwn/iwn marks ways belonging to a hiking route relation. -->
<rule cat="hiking_routes" e="way" k="hknetwork" v="iwn|nwn|rwn|lwn|own|pwn" zoom-min="11">
	<rule  e="way" k="osmc_color" v="wmco_blue" >
   		<xsl:call-template name="trail-highlight-rules">
        	<xsl:with-param name="color" select="$lc-trail-blue" />
    	</xsl:call-template>
	</rule>
	<rule  e="way" k="osmc_color" v="wmco_red" >
   		<xsl:call-template name="trail-highlight-rules">
        	<xsl:with-param name="color" select="$lc-trail-red" />
    	</xsl:call-template>
	</rule>
	<rule  e="way" k="osmc_color" v="wmco_green" >
   		<xsl:call-template name="trail-highlight-rules">
        	<xsl:with-param name="color" select="$lc-trail-green" />
    	</xsl:call-template>
	</rule>
	<rule  e="way" k="osmc_color" v="wmco_yellow" >
   		<xsl:call-template name="trail-highlight-rules">
        	<xsl:with-param name="color" select="$lc-trail-yellow" />
    	</xsl:call-template>
	</rule>
	<rule  e="way" k="osmc_color" v="wmco_purple" >
   		<xsl:call-template name="trail-highlight-rules">
        	<xsl:with-param name="color" select="$lc-trail-purple" />
    	</xsl:call-template>
	</rule>
	<rule  e="way" k="osmc_color" v="wmco_orange" >
   		<xsl:call-template name="trail-highlight-rules">
        	<xsl:with-param name="color" select="$lc-trail-orange" />
    	</xsl:call-template>
	</rule>
	<rule  e="way" k="osmc_color" v="wmco_black" >
   		<xsl:call-template name="trail-highlight-rules">
        	<xsl:with-param name="color" select="$lc-trail-black" />
    	</xsl:call-template>
	</rule>
</rule>

<rule cat="hiking_routes" e="way" k="route" v="ferry" >
	<rule  e="way" k="osmc_color" v="wmco_blue" >
   		<xsl:call-template name="trail-highlight-rules-ferry">
        	<xsl:with-param name="color" select="$lc-trail-blue" />
    	</xsl:call-template>
	</rule>
	<rule  e="way" k="osmc_color" v="wmco_red" >
   		<xsl:call-template name="trail-highlight-rules-ferry">
        	<xsl:with-param name="color" select="$lc-trail-red" />
    	</xsl:call-template>
	</rule>
	<rule  e="way" k="osmc_color" v="wmco_green" >
   		<xsl:call-template name="trail-highlight-rules-ferry">
        	<xsl:with-param name="color" select="$lc-trail-green" />
    	</xsl:call-template>
	</rule>
	<rule  e="way" k="osmc_color" v="wmco_yellow" >
   		<xsl:call-template name="trail-highlight-rules-ferry">
        	<xsl:with-param name="color" select="$lc-trail-yellow" />
    	</xsl:call-template>
	</rule>
	<rule  e="way" k="osmc_color" v="wmco_purple" >
   		<xsl:call-template name="trail-highlight-rules-ferry">
        	<xsl:with-param name="color" select="$lc-trail-purple" />
    	</xsl:call-template>
	</rule>
	<rule  e="way" k="osmc_color" v="wmco_orange" >
   		<xsl:call-template name="trail-highlight-rules-ferry">
        	<xsl:with-param name="color" select="$lc-trail-orange" />
    	</xsl:call-template>
	</rule>
	<rule  e="way" k="osmc_color" v="wmco_black" >
   		<xsl:call-template name="trail-highlight-rules-ferry">
        	<xsl:with-param name="color" select="$lc-trail-black" />
    	</xsl:call-template>
	</rule>
</rule>


</xsl:template>

<xsl:template name="trail-highlight-rules">
<xsl:param name="color" />
	<xsl:call-template name="trail-highlight-rules-unpaved">
		<xsl:with-param name="color" select="$color" />
	</xsl:call-template>
	<xsl:call-template name="trail-highlight-rules-paved">
		<xsl:with-param name="color" select="$color" />
	</xsl:call-template>
	<rule cat="seasonal_closure" e="way" k="{$route_condition}" v="*" >
		<xsl:call-template name="trail-highlight-rules-conditional-unpaved">
			<xsl:with-param name="color" select="$color" />
		</xsl:call-template>
	</rule>

</xsl:template>

</xsl:stylesheet>

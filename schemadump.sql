/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.6.25-MariaDB, for Win64 (AMD64)
--
-- Host: 66.175.239.10    Database: torneos
-- ------------------------------------------------------
-- Server version	10.6.23-MariaDB-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Skeen_tarjetas`
--

DROP TABLE IF EXISTS `Skeen_tarjetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Skeen_tarjetas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_campo` int(10) unsigned zerofill NOT NULL DEFAULT 0000000000,
  `h1` int(10) unsigned NOT NULL DEFAULT 0,
  `h2` int(10) unsigned NOT NULL DEFAULT 0,
  `h3` int(10) unsigned NOT NULL DEFAULT 0,
  `h4` int(10) unsigned NOT NULL DEFAULT 0,
  `h5` int(10) unsigned NOT NULL DEFAULT 0,
  `h6` int(10) unsigned NOT NULL DEFAULT 0,
  `h7` int(10) unsigned NOT NULL DEFAULT 0,
  `h8` int(10) unsigned NOT NULL DEFAULT 0,
  `h9` int(10) unsigned NOT NULL DEFAULT 0,
  `h10` int(10) unsigned NOT NULL DEFAULT 0,
  `h11` int(10) unsigned NOT NULL DEFAULT 0,
  `h12` int(10) unsigned NOT NULL DEFAULT 0,
  `h13` int(10) unsigned NOT NULL DEFAULT 0,
  `h14` int(10) unsigned NOT NULL DEFAULT 0,
  `h15` int(10) unsigned NOT NULL DEFAULT 0,
  `h16` int(10) unsigned NOT NULL DEFAULT 0,
  `h17` int(10) unsigned NOT NULL DEFAULT 0,
  `h18` int(10) unsigned NOT NULL DEFAULT 0,
  `h1_a` int(10) NOT NULL DEFAULT 0,
  `h2_a` int(10) NOT NULL DEFAULT 0,
  `h3_a` int(10) NOT NULL DEFAULT 0,
  `h4_a` int(10) NOT NULL DEFAULT 0,
  `h5_a` int(10) NOT NULL DEFAULT 0,
  `h6_a` int(10) NOT NULL DEFAULT 0,
  `h7_a` int(10) NOT NULL DEFAULT 0,
  `h8_a` int(10) NOT NULL DEFAULT 0,
  `h9_a` int(10) NOT NULL DEFAULT 0,
  `h10_a` int(10) NOT NULL DEFAULT 0,
  `h11_a` int(10) NOT NULL DEFAULT 0,
  `h12_a` int(10) NOT NULL DEFAULT 0,
  `h13_a` int(10) NOT NULL DEFAULT 0,
  `h14_a` int(10) NOT NULL DEFAULT 0,
  `h15_a` int(10) NOT NULL DEFAULT 0,
  `h16_a` int(10) NOT NULL DEFAULT 0,
  `h17_a` int(10) NOT NULL DEFAULT 0,
  `h18_a` int(10) NOT NULL DEFAULT 0,
  `jugadorid` int(10) unsigned NOT NULL DEFAULT 0,
  `fecha_cap` date NOT NULL DEFAULT '1900-01-01',
  `tee_salida` int(10) unsigned NOT NULL DEFAULT 2,
  `color_tee` varchar(15) NOT NULL DEFAULT 'BLANCAS',
  `SO` int(10) unsigned NOT NULL DEFAULT 0,
  `SA` int(10) unsigned NOT NULL DEFAULT 0,
  `dif` double NOT NULL DEFAULT 0,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_juego` date NOT NULL DEFAULT '2000-01-01',
  `tipo` char(1) NOT NULL DEFAULT 'N',
  `salidagrupoid` int(10) unsigned NOT NULL DEFAULT 0,
  `categoriaid` bigint(20) NOT NULL DEFAULT 0,
  `utiliza` int(10) unsigned NOT NULL DEFAULT 0,
  `slope` double NOT NULL DEFAULT 113,
  `rating` double NOT NULL DEFAULT 72,
  `torneoid` int(11) NOT NULL DEFAULT 0,
  `orden` int(11) NOT NULL DEFAULT 0,
  `hcpcampo` int(11) NOT NULL DEFAULT 0,
  `ventajas_json` varchar(245) DEFAULT NULL,
  `resultadosnetos` varchar(245) DEFAULT NULL,
  `resultadosgross` varchar(245) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Index_id_campo` (`id_campo`),
  KEY `Index_id_jug` (`jugadorid`),
  KEY `Index_feca_cap` (`fecha_cap`),
  KEY `Index_tee` (`tee_salida`),
  KEY `Index_6` (`color_tee`),
  KEY `Index_dif` (`dif`),
  KEY `Index_estado` (`estado`),
  KEY `Index_fecha_juego` (`fecha_juego`),
  KEY `tipo` (`tipo`),
  KEY `index_club_cap` (`salidagrupoid`),
  KEY `id_tar_club` (`categoriaid`),
  KEY `Index_13` (`utiliza`),
  KEY `orden` (`orden`)
) ENGINE=MyISAM AUTO_INCREMENT=548056 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `approach`
--

DROP TABLE IF EXISTS `approach`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `approach` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) NOT NULL DEFAULT ' ',
  `orden` int(11) NOT NULL DEFAULT 1,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL,
  `descripcion` varchar(50) NOT NULL DEFAULT ' ',
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `fecha` (`fecha`)
) ENGINE=MyISAM AUTO_INCREMENT=4827 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `approachjug`
--

DROP TABLE IF EXISTS `approachjug`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `approachjug` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL DEFAULT 0,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `jugadorid` int(11) NOT NULL DEFAULT 0,
  `distancia` double(10,3) NOT NULL DEFAULT 9999.000,
  `fecha` date NOT NULL,
  `ultact` datetime DEFAULT current_timestamp(),
  `premiosjugcol` varchar(50) DEFAULT NULL,
  `ultact_2` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `torneoid_2` (`torneoid`,`campo`,`hoyo`,`fecha`,`jugadorid`,`premiosjugcol`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `distancia` (`distancia`),
  KEY `cc` (`fecha`),
  KEY `ff` (`jugadorid`)
) ENGINE=MyISAM AUTO_INCREMENT=2380 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `avance`
--

DROP TABLE IF EXISTS `avance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `avance` (
  `idavance` int(11) NOT NULL AUTO_INCREMENT,
  `salidagrupoid` int(11) DEFAULT NULL,
  `hoyo` int(11) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `tarjetaid` int(11) DEFAULT NULL,
  PRIMARY KEY (`idavance`),
  KEY `salidagpoid` (`salidagrupoid`),
  KEY `xx` (`hoyo`),
  KEY `cc` (`fecha`),
  KEY `vv` (`tarjetaid`)
) ENGINE=InnoDB AUTO_INCREMENT=103110 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `caljuego`
--

DROP TABLE IF EXISTS `caljuego`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `caljuego` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `categoria` varchar(25) NOT NULL,
  `fecha` date DEFAULT NULL,
  `campo` int(11) NOT NULL DEFAULT 0,
  `orden` int(11) NOT NULL,
  `numfechajgo` int(11) NOT NULL DEFAULT 1,
  `ordenSal` int(11) NOT NULL DEFAULT 1,
  `numjug` int(11) NOT NULL DEFAULT 0,
  `numfoursome` int(11) NOT NULL DEFAULT 0,
  `foursomevuelta2` int(11) NOT NULL DEFAULT 0,
  `minutossal2` int(11) NOT NULL DEFAULT 10,
  `horainicio_1` time NOT NULL DEFAULT '07:00:00',
  `horainicio_10` time NOT NULL DEFAULT '07:00:00',
  `numgpos_1` varchar(100) NOT NULL DEFAULT '4',
  `numgpos_10` int(11) NOT NULL DEFAULT 0,
  `estatus` int(11) NOT NULL DEFAULT 0,
  `fecha_cambioestatus` varchar(25) NOT NULL DEFAULT '1900-01-01 00:00:01',
  `ordensalidas2` int(11) NOT NULL DEFAULT 0,
  `otiposalidas2` int(11) NOT NULL DEFAULT 0,
  `numjugfoursome` int(11) NOT NULL DEFAULT 4,
  `cierre` int(11) NOT NULL DEFAULT 0,
  `salhoyos` varchar(100) NOT NULL DEFAULT '1,1,1,1,1,1,1,1,1,1',
  `categoriaid` int(11) DEFAULT NULL,
  `estilojuego` varchar(45) DEFAULT 'Personal',
  `porcetajejgo` int(11) DEFAULT 100,
  `porcetajejgo2` int(11) DEFAULT 15,
  `subgrupo` varchar(1) DEFAULT 'A',
  `ms_jugid` int(11) DEFAULT 0,
  `ms_score` int(11) DEFAULT 0,
  `skin` int(11) DEFAULT 1,
  `resultmingross` varchar(245) DEFAULT NULL,
  `resultminneto` varchar(145) DEFAULT NULL,
  `resulttotgross` varchar(245) DEFAULT NULL,
  `resulttotneto` varchar(145) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`),
  KEY `orden` (`orden`),
  KEY `numfechajgo` (`numfechajgo`),
  KEY `cierre` (`cierre`),
  KEY `xx` (`categoriaid`),
  KEY `skinx` (`skin`)
) ENGINE=MyISAM AUTO_INCREMENT=33649 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `campo_tee`
--

DROP TABLE IF EXISTS `campo_tee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `campo_tee` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `salidaid` int(10) unsigned NOT NULL DEFAULT 0,
  `campoid` int(10) unsigned zerofill NOT NULL DEFAULT 0000000000,
  `slope` double unsigned NOT NULL DEFAULT 0,
  `rating` double unsigned NOT NULL DEFAULT 0,
  `max_hcp` int(11) NOT NULL DEFAULT 0,
  `activa` tinyint(1) NOT NULL,
  `parcampo` int(11) DEFAULT 72,
  `orden` int(11) DEFAULT 1,
  `ventajas` varchar(145) DEFAULT NULL,
  `parcampohoyo` varchar(145) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Index_2` (`salidaid`),
  KEY `Index_3` (`campoid`),
  KEY `activa` (`activa`)
) ENGINE=MyISAM AUTO_INCREMENT=1552 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `campos`
--

DROP TABLE IF EXISTS `campos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `campos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `campo` varchar(45) NOT NULL DEFAULT '',
  `id_club` int(10) unsigned zerofill NOT NULL DEFAULT 0000000001,
  `campo_id` int(10) unsigned zerofill NOT NULL DEFAULT 0000000000,
  `activo` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `Index_campo` (`campo`),
  KEY `Index_id_club` (`id_club`),
  KEY `activo` (`activo`),
  KEY `campo_id` (`campo_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9952 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `campos_registro`
--

DROP TABLE IF EXISTS `campos_registro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `campos_registro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) DEFAULT NULL,
  `torneoid` int(11) DEFAULT NULL,
  `registro1` int(11) DEFAULT 0,
  `registro2` int(11) DEFAULT 0,
  `longitug` int(11) DEFAULT 2,
  `orden` int(11) DEFAULT 0,
  `renglon` int(11) DEFAULT 0,
  `nom_display` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=146 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `categoria_id` int(11) NOT NULL AUTO_INCREMENT,
  `torneo_id` int(11) NOT NULL,
  `categoria` varchar(25) DEFAULT NULL,
  `sistema` varchar(25) DEFAULT 'Match Play',
  `formato` varchar(25) DEFAULT 'Individual',
  `estilo` varchar(25) DEFAULT 'Personal',
  `salida` varchar(25) DEFAULT NULL,
  `hcpCampoMin` int(11) DEFAULT 0,
  `hcpCampoMax` int(11) DEFAULT 0,
  `hcpIdxMin` double DEFAULT 0,
  `hcpIdxMax` double DEFAULT 0,
  `porcentaje` int(11) DEFAULT 80,
  `maxjugadores` int(11) DEFAULT 25,
  `corte` int(11) DEFAULT 8,
  `criterio_corte` varchar(45) DEFAULT 'Empates',
  `criterioDesempate` varchar(45) DEFAULT 'Retrogresion',
  `gross` int(11) DEFAULT 0,
  `hoyosajugar` int(11) DEFAULT 36,
  `hoyosacorte` int(11) DEFAULT 36,
  `fechaHandicap` varchar(10) DEFAULT '1900-01-01',
  `estatus` int(11) NOT NULL DEFAULT 1,
  `numjug` int(11) NOT NULL DEFAULT 0,
  `numfoursome` int(11) NOT NULL DEFAULT 0,
  `tipocorte` int(11) NOT NULL DEFAULT 1,
  `sexo` varchar(1) DEFAULT 'M',
  `Skeenporcent` int(11) NOT NULL DEFAULT 0,
  `Skin_grupo_id` int(11) NOT NULL DEFAULT 0,
  `numjuggross` int(11) DEFAULT 1,
  `numjugprem` int(11) DEFAULT 3,
  `carrousel` int(11) NOT NULL DEFAULT 0,
  `golforo` int(11) DEFAULT 100,
  `categoriascol` varchar(45) DEFAULT NULL,
  `grossstb` int(11) DEFAULT 0,
  `abreviatura` varchar(15) DEFAULT NULL,
  `hoyosxronda` int(11) DEFAULT 18,
  `fecha2` date DEFAULT NULL,
  `fecha1` date DEFAULT NULL,
  `tipoed` int(11) DEFAULT 1,
  `catrel` int(11) DEFAULT 0,
  `livescoring` int(11) DEFAULT 0,
  `handicapparejas` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`categoria_id`),
  KEY `sexo` (`sexo`),
  KEY `ff` (`torneo_id`),
  KEY `gg` (`categoria`),
  KEY `carrousel` (`carrousel`),
  KEY `liveso` (`livescoring`)
) ENGINE=MyISAM AUTO_INCREMENT=6259 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`tomas.obeso`@`%`*/ /*!50003 TRIGGER `torneos`.`categorias_AFTER_UPDATE` AFTER UPDATE ON `categorias` FOR EACH ROW
BEGIN
declare x int;
declare torid int;
set torid=new.torneo_id;
if (new.sistema='MATCH PLAY') then begin
	SELECT count(*) into x FROM elimin_salidas_cat where catid=new.categoria_id ;
    if (x=0) then begin
		insert into elimin_salidas_cat (  torneoid, dia, salida, pl_grupo, sl_grupo, matchx, catid) 
        SELECT   torid, dia, salida, pl_grupo, sl_grupo, matchx,new.categoria_id FROM elimin_salidas_template ;
        
    end; end if;
    SELECT count(*) into x FROM elimin_salidas_cat where catid=new.categoria_id and  matchx>200 ;
    IF(NEW.tipoed=4 and x=0) Then begin
			insert into elimin_salidas_cat (  torneoid, dia, salida, pl_grupo, sl_grupo, matchx, catid) 
			SELECT   torid, dia, salida,IF((pl_grupo REGEXP '[0-9]+')=1,pl_grupo+100,CONCAT(2,pl_grupo)), IF((sl_grupo REGEXP '[0-9]+')=1,SL_GRUPO+100,CONCAT(2,SL_GRUPO)) , (matchx+100),new.categoria_id FROM elimin_salidas_template ;
        end; end if;
end; end if;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `categorias_tmp`
--

DROP TABLE IF EXISTS `categorias_tmp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_tmp` (
  `categoriasTmp_id` int(11) NOT NULL AUTO_INCREMENT,
  `categoria` varchar(25) DEFAULT NULL,
  `sistema` varchar(25) DEFAULT 'Match Play',
  `formato` varchar(25) DEFAULT 'Individual',
  `estilo` varchar(25) DEFAULT 'Personal',
  `salida` varchar(25) DEFAULT NULL,
  `hcpCampoMin` int(11) DEFAULT 0,
  `hcpCampoMax` int(11) DEFAULT 0,
  `hcpIdxMin` double DEFAULT 0,
  `hcpIdxMax` double DEFAULT 0,
  `porcentaje` int(11) DEFAULT 80,
  `maxjugadores` int(11) DEFAULT 25,
  `corte` int(11) DEFAULT 8,
  `criterio_corte` varchar(45) DEFAULT 'Empates',
  `criterioDesempate` varchar(45) DEFAULT 'Retrogresion',
  `gross` int(11) DEFAULT 0,
  `hoyosajugar` int(11) DEFAULT 36,
  `hoyosacorte` int(11) DEFAULT 36,
  `fechaHandicap` date DEFAULT NULL,
  `fecha1` date DEFAULT NULL,
  `fecha2` date DEFAULT NULL,
  `fecha3` date DEFAULT NULL,
  `fecha4` date DEFAULT NULL,
  `fecha5` date DEFAULT NULL,
  `fecha6` date DEFAULT NULL,
  `fecha7` date DEFAULT NULL,
  `fecha8` date DEFAULT NULL,
  `fecha9` date DEFAULT NULL,
  `fecha10` date DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`categoriasTmp_id`),
  KEY `orden` (`orden`)
) ENGINE=MyISAM AUTO_INCREMENT=20 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_state` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cities_states` (`id_state`),
  CONSTRAINT `fk_cities_states` FOREIGN KEY (`id_state`) REFERENCES `states` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=790315 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clubs`
--

DROP TABLE IF EXISTS `clubs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `clubs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL DEFAULT '',
  `ciudad` varchar(25) NOT NULL DEFAULT '',
  `estado` varchar(25) NOT NULL DEFAULT '',
  `pais` varchar(15) NOT NULL DEFAULT 'Mexico',
  `hoyos` int(10) unsigned NOT NULL DEFAULT 18,
  `numero` int(10) unsigned NOT NULL DEFAULT 0,
  `logo` varchar(100) NOT NULL DEFAULT '',
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `abr` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `nombre` (`nombre`),
  KEY `Index_ciudad` (`ciudad`),
  KEY `numero` (`numero`),
  KEY `status` (`status`)
) ENGINE=MyISAM AUTO_INCREMENT=770125 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clubs_registro`
--

DROP TABLE IF EXISTS `clubs_registro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `clubs_registro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) DEFAULT NULL,
  `clubid` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `a` (`torneoid`),
  KEY `s` (`clubid`)
) ENGINE=InnoDB AUTO_INCREMENT=13778 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `correos_spei`
--

DROP TABLE IF EXISTS `correos_spei`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `correos_spei` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usu` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `enviados` int(11) NOT NULL,
  `fecha_ult` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=247 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cuentas_correo`
--

DROP TABLE IF EXISTS `cuentas_correo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuentas_correo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `cuenta_correo` varchar(45) DEFAULT NULL,
  `numcorreos` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dd_estilo`
--

DROP TABLE IF EXISTS `dd_estilo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dd_estilo` (
  `idd_estilo` int(11) NOT NULL AUTO_INCREMENT,
  `estilo` varchar(25) DEFAULT NULL,
  `descrip` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`idd_estilo`),
  UNIQUE KEY `sistema_UNIQUE` (`estilo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dd_estsalida`
--

DROP TABLE IF EXISTS `dd_estsalida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dd_estsalida` (
  `k` int(11) NOT NULL AUTO_INCREMENT,
  `v` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dd_familia`
--

DROP TABLE IF EXISTS `dd_familia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dd_familia` (
  `k` int(11) NOT NULL AUTO_INCREMENT,
  `v` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dd_formato`
--

DROP TABLE IF EXISTS `dd_formato`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dd_formato` (
  `idd_formato` int(11) NOT NULL AUTO_INCREMENT,
  `formato` varchar(25) DEFAULT NULL,
  `descrip` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`idd_formato`),
  UNIQUE KEY `sistema_UNIQUE` (`formato`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dd_gnal`
--

DROP TABLE IF EXISTS `dd_gnal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dd_gnal` (
  `llave` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` int(11) DEFAULT 1,
  `k` int(1) DEFAULT 1,
  `v` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`llave`),
  KEY `tipo` (`tipo`),
  KEY `k` (`k`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dd_sistema`
--

DROP TABLE IF EXISTS `dd_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dd_sistema` (
  `idd_sistema` int(11) NOT NULL AUTO_INCREMENT,
  `sistema` varchar(25) DEFAULT NULL,
  `descrip` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`idd_sistema`),
  UNIQUE KEY `sistema_UNIQUE` (`sistema`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dd_stattor`
--

DROP TABLE IF EXISTS `dd_stattor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dd_stattor` (
  `iddd_stattor` int(11) NOT NULL AUTO_INCREMENT,
  `estatus` varchar(1) DEFAULT NULL,
  `descrip` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`iddd_stattor`),
  UNIQUE KEY `estatus_UNIQUE` (`estatus`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dd_tipocampo`
--

DROP TABLE IF EXISTS `dd_tipocampo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dd_tipocampo` (
  `k` int(11) NOT NULL,
  `v` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dd_tipocorte`
--

DROP TABLE IF EXISTS `dd_tipocorte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dd_tipocorte` (
  `k` int(11) NOT NULL,
  `v` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dd_tipopro`
--

DROP TABLE IF EXISTS `dd_tipopro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dd_tipopro` (
  `k` int(11) NOT NULL AUTO_INCREMENT,
  `v` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dd_tiposalida`
--

DROP TABLE IF EXISTS `dd_tiposalida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dd_tiposalida` (
  `k` int(11) NOT NULL,
  `v` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `diasjuego`
--

DROP TABLE IF EXISTS `diasjuego`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `diasjuego` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `foursomevuelta` int(11) NOT NULL DEFAULT 13,
  `minutossal` int(11) NOT NULL DEFAULT 10,
  `horainicio` time NOT NULL DEFAULT '07:00:00',
  `minutosvuelta` int(11) NOT NULL DEFAULT 130,
  `horainiciopm` time NOT NULL DEFAULT '12:00:00',
  `estatus` int(11) NOT NULL DEFAULT 0,
  `ordensalidas` int(11) NOT NULL DEFAULT 0,
  `tiposalidas` int(11) NOT NULL DEFAULT 1,
  `estatusam` int(11) NOT NULL DEFAULT 0,
  `estatuspm` int(11) NOT NULL DEFAULT 0,
  `CAMPO` int(11) NOT NULL DEFAULT 0,
  `categoriaid` int(11) NOT NULL DEFAULT 1,
  `publica` int(11) NOT NULL DEFAULT 0,
  `correo` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `torneoid_2` (`torneoid`,`fecha`),
  KEY `torneoid` (`torneoid`),
  KEY `fecha` (`fecha`),
  KEY `estatus` (`estatus`),
  KEY `CAMPO` (`CAMPO`),
  KEY `categoriaid` (`categoriaid`),
  KEY `publica` (`publica`),
  KEY `correo` (`correo`)
) ENGINE=MyISAM AUTO_INCREMENT=342 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `driver`
--

DROP TABLE IF EXISTS `driver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) NOT NULL DEFAULT ' ',
  `orden` int(11) NOT NULL DEFAULT 1,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL,
  `descripcion` varchar(50) NOT NULL DEFAULT ' ',
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `fecha` (`fecha`)
) ENGINE=MyISAM AUTO_INCREMENT=1383 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `driverjug`
--

DROP TABLE IF EXISTS `driverjug`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `driverjug` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL DEFAULT 0,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `jugadorid` int(11) NOT NULL DEFAULT 0,
  `distancia` double(10,3) NOT NULL DEFAULT 9999.000,
  `fecha` date NOT NULL,
  `ultact` datetime DEFAULT current_timestamp(),
  `premiosjugcol` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `distancia` (`distancia`),
  KEY `cc` (`fecha`),
  KEY `ff` (`jugadorid`)
) ENGINE=MyISAM AUTO_INCREMENT=431 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `driverjugp`
--

DROP TABLE IF EXISTS `driverjugp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `driverjugp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL DEFAULT 0,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `jugadorid` int(11) NOT NULL DEFAULT 0,
  `distancia` double(10,3) NOT NULL DEFAULT 9999.000,
  `fecha` date NOT NULL,
  `ultact` datetime DEFAULT current_timestamp(),
  `premiosjugcol` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `distancia` (`distancia`),
  KEY `cc` (`fecha`),
  KEY `ff` (`jugadorid`)
) ENGINE=MyISAM AUTO_INCREMENT=165 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `driverp`
--

DROP TABLE IF EXISTS `driverp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `driverp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) NOT NULL DEFAULT ' ',
  `orden` int(11) NOT NULL DEFAULT 1,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL,
  `descripcion` varchar(50) NOT NULL DEFAULT ' ',
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `fecha` (`fecha`)
) ENGINE=MyISAM AUTO_INCREMENT=1017 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `elimin_salidas`
--

DROP TABLE IF EXISTS `elimin_salidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `elimin_salidas` (
  `idelimin_salidas` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) DEFAULT 1,
  `dia` int(11) DEFAULT NULL,
  `salida` int(11) DEFAULT NULL,
  `pl_grupo` varchar(5) DEFAULT NULL,
  `sl_grupo` varchar(5) DEFAULT NULL,
  `matchx` int(11) DEFAULT NULL,
  PRIMARY KEY (`idelimin_salidas`),
  KEY `gg` (`torneoid`),
  KEY `hh` (`dia`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `elimin_salidas_cat`
--

DROP TABLE IF EXISTS `elimin_salidas_cat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `elimin_salidas_cat` (
  `idelimin_salidas` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) DEFAULT 1,
  `dia` int(11) DEFAULT NULL,
  `salida` int(11) DEFAULT NULL,
  `pl_grupo` varchar(5) DEFAULT NULL,
  `sl_grupo` varchar(5) DEFAULT NULL,
  `matchx` int(11) DEFAULT NULL,
  `catid` int(11) DEFAULT NULL,
  `posicionp` int(11) DEFAULT 0,
  `posicions` int(11) DEFAULT 0,
  `fecha` datetime DEFAULT NULL,
  `resultado` varchar(15) DEFAULT NULL,
  `gano` int(11) DEFAULT 0,
  `hoyo` varchar(5) DEFAULT NULL,
  `jugida` int(11) DEFAULT 0,
  `jugidb` int(11) DEFAULT 0,
  PRIMARY KEY (`idelimin_salidas`),
  KEY `gg` (`torneoid`),
  KEY `hh` (`dia`),
  KEY `catid` (`catid`),
  KEY `a` (`posicionp`),
  KEY `s` (`posicions`),
  KEY `d` (`pl_grupo`),
  KEY `f` (`sl_grupo`),
  KEY `g` (`matchx`),
  KEY `h` (`jugida`),
  KEY `j` (`jugidb`),
  KEY `t` (`gano`)
) ENGINE=InnoDB AUTO_INCREMENT=1231 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `elimin_salidas_template`
--

DROP TABLE IF EXISTS `elimin_salidas_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `elimin_salidas_template` (
  `idelimin_salidas_template` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) DEFAULT 1,
  `dia` int(11) DEFAULT NULL,
  `salida` int(11) DEFAULT NULL,
  `pl_grupo` varchar(5) DEFAULT NULL,
  `sl_grupo` varchar(5) DEFAULT NULL,
  `matchx` int(11) DEFAULT NULL,
  PRIMARY KEY (`idelimin_salidas_template`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `estatusjug`
--

DROP TABLE IF EXISTS `estatusjug`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `estatusjug` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `estatus` varchar(45) NOT NULL,
  `estatusid` int(11) NOT NULL,
  `tipoestatus` varchar(3) NOT NULL DEFAULT '111',
  `imagen` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`),
  KEY `tipoestatus` (`tipoestatus`)
) ENGINE=MyISAM AUTO_INCREMENT=417 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `estatusjugt`
--

DROP TABLE IF EXISTS `estatusjugt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `estatusjugt` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `estatus` varchar(45) NOT NULL,
  `estatusid` int(11) NOT NULL,
  `tipoestatus` varchar(3) NOT NULL DEFAULT '111',
  `imagen` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tipoestatus` (`tipoestatus`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `estatuspago`
--

DROP TABLE IF EXISTS `estatuspago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `estatuspago` (
  `k` int(11) NOT NULL AUTO_INCREMENT,
  `v` varchar(45) DEFAULT '',
  PRIMARY KEY (`k`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gps`
--

DROP TABLE IF EXISTS `gps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `gps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `salidaid` int(11) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `georeferencia` varchar(45) DEFAULT NULL,
  `otro` decimal(12,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `a` (`salidaid`),
  KEY `s` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=8977 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `grupos`
--

DROP TABLE IF EXISTS `grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equipo` varchar(20) NOT NULL,
  `grupo` varchar(2) NOT NULL DEFAULT 'A',
  `categoria` int(11) NOT NULL,
  `numero` int(11) DEFAULT 0,
  `ptos` int(11) DEFAULT 0,
  `jgos2s` int(11) DEFAULT 0,
  `jgos3s` int(11) DEFAULT 0,
  `difjgosg` int(11) DEFAULT 0,
  `difjgostot` int(11) DEFAULT 0,
  `gh` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `q` (`equipo`,`categoria`),
  KEY `d` (`equipo`),
  KEY `f` (`grupo`),
  KEY `g` (`categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hoyos`
--

DROP TABLE IF EXISTS `hoyos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoyos` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `numero` int(10) unsigned NOT NULL DEFAULT 0,
  `par` int(10) unsigned NOT NULL DEFAULT 0,
  `campoid` int(10) unsigned NOT NULL DEFAULT 0,
  `minutos` int(11) NOT NULL DEFAULT 16,
  PRIMARY KEY (`ID`),
  KEY `Index_2` (`numero`),
  KEY `Index_3` (`par`),
  KEY `Index_4` (`campoid`)
) ENGINE=MyISAM AUTO_INCREMENT=5358 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hoyosxsalida`
--

DROP TABLE IF EXISTS `hoyosxsalida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoyosxsalida` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `numero` int(10) unsigned NOT NULL DEFAULT 0,
  `par` int(10) unsigned NOT NULL DEFAULT 0,
  `campoid` int(10) unsigned NOT NULL DEFAULT 0,
  `salidaid` int(11) unsigned NOT NULL DEFAULT 0,
  `ventaja` int(11) NOT NULL DEFAULT 0,
  `yardaje` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`),
  KEY `Index_2` (`numero`),
  KEY `Index_3` (`par`),
  KEY `Index_4` (`campoid`),
  KEY `salida` (`salidaid`)
) ENGINE=MyISAM AUTO_INCREMENT=34292 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jugadores`
--

DROP TABLE IF EXISTS `jugadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jugadores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `numjugador` varchar(15) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `fechahandicap` date NOT NULL,
  `sexo` varchar(1) NOT NULL,
  `hcpindex` double NOT NULL,
  `teesalidaid` int(11) NOT NULL,
  `salida` varchar(20) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `club` varchar(250) NOT NULL,
  `tipoinsc` int(11) NOT NULL DEFAULT 1,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `tipoinsc2` int(11) NOT NULL DEFAULT 3,
  `grupoid` varchar(20) NOT NULL DEFAULT '',
  `indexjgo` double NOT NULL DEFAULT 0,
  `fechareg` timestamp NOT NULL DEFAULT '2000-01-01 00:00:00',
  `estatus` varchar(20) NOT NULL DEFAULT 'NORMAL',
  `cd1` int(11) NOT NULL DEFAULT 0,
  `cd2` int(11) NOT NULL DEFAULT 0,
  `cd3` int(11) NOT NULL DEFAULT 0,
  `cd4` int(11) NOT NULL DEFAULT 0,
  `cd5` int(11) NOT NULL DEFAULT 0,
  `cd6` int(11) NOT NULL DEFAULT 0,
  `campgross` int(11) NOT NULL DEFAULT 0,
  `muertesubita` int(11) NOT NULL DEFAULT 0,
  `estgross` int(11) NOT NULL DEFAULT 0,
  `Skeenjuga` int(11) NOT NULL DEFAULT 0,
  `Skeenjugagnal` int(11) NOT NULL DEFAULT 0,
  `golforo` double DEFAULT 0,
  `sumrr` int(11) DEFAULT 0,
  `sumdif` int(11) DEFAULT 0,
  `clubid` int(11) DEFAULT 0,
  `sistema` varchar(45) DEFAULT 'STROKEPLAY',
  `wpid` int(11) DEFAULT 0,
  `equipo` varchar(5) DEFAULT '',
  `posicion` int(11) DEFAULT 9999,
  `subgrupo` varchar(1) DEFAULT 'A',
  `doble` int(11) DEFAULT 0,
  `reg_spei` varchar(45) DEFAULT NULL,
  `numghinspei` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `torneoid_2` (`torneoid`,`numjugador`,`club`,`nombre`,`apellido`,`correo`),
  KEY `torneoid` (`torneoid`,`numjugador`,`fechahandicap`),
  KEY `categoriaid` (`categoriaid`),
  KEY `tipoinsc2` (`tipoinsc2`),
  KEY `grupoid` (`grupoid`),
  KEY `estatus` (`estatus`),
  KEY `cd1` (`cd1`),
  KEY `cd2` (`cd2`),
  KEY `cd3` (`cd3`),
  KEY `cd4` (`cd4`),
  KEY `cd5` (`cd5`),
  KEY `cd6` (`cd6`),
  KEY `murtesubita` (`muertesubita`),
  KEY `Skeenjuga` (`Skeenjuga`),
  KEY `Skeenjugagnal` (`Skeenjugagnal`),
  KEY `club` (`club`),
  KEY `clubid` (`clubid`),
  KEY `teesal` (`teesalidaid`),
  KEY `SS` (`subgrupo`),
  KEY `doble` (`doble`)
) ENGINE=MyISAM AUTO_INCREMENT=263698 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`tomas.obeso`@`%`*/ /*!50003 TRIGGER aft_upd_jug after update  ON jugadores
       FOR EACH ROW call  sp_acted(new.categoriaid,new.id) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `jugadores_temp`
--

DROP TABLE IF EXISTS `jugadores_temp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jugadores_temp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `numjugador` varchar(15) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `fechahandicap` date NOT NULL,
  `sexo` varchar(1) NOT NULL,
  `hcpindex` double NOT NULL,
  `teesalidaid` int(11) NOT NULL,
  `salida` varchar(20) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `club` varchar(250) NOT NULL,
  `tipoinsc` int(11) NOT NULL DEFAULT 1,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `tipoinsc2` int(11) NOT NULL DEFAULT 3,
  `grupoid` varchar(20) NOT NULL DEFAULT '0',
  `indexjgo` double NOT NULL DEFAULT 0,
  `fechareg` timestamp NOT NULL DEFAULT '2000-01-01 00:00:00',
  `estatus` varchar(20) NOT NULL DEFAULT 'NORMAL',
  `clubid` int(11) DEFAULT 0,
  `sistema` varchar(45) DEFAULT 'STROKEPLAY',
  `documento` mediumblob DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `torneoid_2` (`torneoid`,`numjugador`,`club`,`nombre`,`apellido`),
  KEY `torneoid` (`torneoid`,`numjugador`,`fechahandicap`),
  KEY `categoriaid` (`categoriaid`),
  KEY `tipoinsc2` (`tipoinsc2`),
  KEY `grupoid` (`grupoid`),
  KEY `estatus` (`estatus`),
  KEY `club` (`club`),
  KEY `clubid` (`clubid`),
  KEY `teesal` (`teesalidaid`)
) ENGINE=MyISAM AUTO_INCREMENT=235194 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mejorscorejugp`
--

DROP TABLE IF EXISTS `mejorscorejugp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mejorscorejugp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL DEFAULT 0,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `jugadorid` int(11) NOT NULL DEFAULT 0,
  `distancia` double(10,3) NOT NULL DEFAULT 9999.000,
  `fecha` date NOT NULL,
  `ultact` datetime DEFAULT current_timestamp(),
  `premiosjugcol` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `distancia` (`distancia`),
  KEY `cc` (`fecha`),
  KEY `ff` (`jugadorid`)
) ENGINE=MyISAM AUTO_INCREMENT=109 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mejorscorep`
--

DROP TABLE IF EXISTS `mejorscorep`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mejorscorep` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) NOT NULL DEFAULT ' ',
  `orden` int(11) NOT NULL DEFAULT 1,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL,
  `descripcion` varchar(50) NOT NULL DEFAULT ' ',
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `fecha` (`fecha`)
) ENGINE=MyISAM AUTO_INCREMENT=1112 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mensajes`
--

DROP TABLE IF EXISTS `mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) DEFAULT 0,
  `mensaje` varchar(256) DEFAULT NULL,
  `todos` int(11) DEFAULT 0,
  `zonaid` int(11) DEFAULT 0,
  `tutorid` int(11) DEFAULT 0,
  `jugadorid` int(11) DEFAULT 0,
  `etapa` int(11) DEFAULT 0,
  `categoria` int(11) DEFAULT 0,
  `usuario` int(11) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `comentarios` varchar(45) DEFAULT NULL,
  `aquien` int(11) DEFAULT NULL,
  `valor` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mensajes_det_jug`
--

DROP TABLE IF EXISTS `mensajes_det_jug`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_det_jug` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) DEFAULT 0,
  `mensajeid` int(11) DEFAULT NULL,
  `jugid` int(11) DEFAULT NULL,
  `familiaid` int(11) DEFAULT NULL,
  `leido` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mensajes_det_pro`
--

DROP TABLE IF EXISTS `mensajes_det_pro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_det_pro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) DEFAULT 0,
  `mensajeid` int(11) DEFAULT NULL,
  `proid` int(11) DEFAULT NULL,
  `leido` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mensajes_detalle`
--

DROP TABLE IF EXISTS `mensajes_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_detalle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) DEFAULT 0,
  `mensajeid` int(11) DEFAULT NULL,
  `jugadorid` int(11) DEFAULT NULL,
  `tutorid` int(11) DEFAULT NULL,
  `leido` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mensajes_jug`
--

DROP TABLE IF EXISTS `mensajes_jug`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_jug` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mensaje` varchar(256) DEFAULT NULL,
  `todos` int(11) DEFAULT 0,
  `categoriaid` int(11) DEFAULT 0,
  `clubid` int(11) DEFAULT 0,
  `familiaid` int(11) DEFAULT 0,
  `fecha` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `comentarios` varchar(45) DEFAULT '',
  `torneoid` int(11) DEFAULT 0,
  `estatus` int(11) DEFAULT 0,
  `jugid` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mensajes_pro`
--

DROP TABLE IF EXISTS `mensajes_pro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_pro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mensaje` varchar(256) DEFAULT NULL,
  `todos` int(11) DEFAULT 0,
  `proid` int(11) DEFAULT 0,
  `clubid` int(11) DEFAULT 0,
  `tipoid` int(11) DEFAULT 0,
  `fecha` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `comentarios` varchar(45) DEFAULT '',
  `torneoid` int(11) DEFAULT 0,
  `estatus` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `oyesx`
--

DROP TABLE IF EXISTS `oyesx`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `oyesx` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) NOT NULL DEFAULT ' ',
  `orden` int(11) NOT NULL DEFAULT 1,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL,
  `descripcion` varchar(50) NOT NULL DEFAULT ' ',
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `fecha` (`fecha`)
) ENGINE=MyISAM AUTO_INCREMENT=4814 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `oyesxjug`
--

DROP TABLE IF EXISTS `oyesxjug`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `oyesxjug` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL DEFAULT 0,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `jugadorid` int(11) NOT NULL DEFAULT 0,
  `distancia` double(10,3) NOT NULL DEFAULT 9999.000,
  `fecha` date NOT NULL,
  `ultact` datetime DEFAULT current_timestamp(),
  `premiosjugcol` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `distancia` (`distancia`),
  KEY `cc` (`fecha`),
  KEY `ff` (`jugadorid`)
) ENGINE=MyISAM AUTO_INCREMENT=2742 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `par_campo`
--

DROP TABLE IF EXISTS `par_campo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `par_campo` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_campo` int(10) unsigned zerofill NOT NULL DEFAULT 0000000000,
  `h1` int(10) unsigned NOT NULL DEFAULT 0,
  `h2` int(10) unsigned NOT NULL DEFAULT 0,
  `h3` int(10) unsigned NOT NULL DEFAULT 0,
  `h4` int(10) unsigned NOT NULL DEFAULT 0,
  `h5` int(10) unsigned NOT NULL DEFAULT 0,
  `h6` int(10) unsigned NOT NULL DEFAULT 0,
  `h7` int(10) unsigned NOT NULL DEFAULT 0,
  `h8` int(10) unsigned NOT NULL DEFAULT 0,
  `h9` int(10) unsigned NOT NULL DEFAULT 0,
  `h10` int(10) unsigned NOT NULL DEFAULT 0,
  `h11` int(10) unsigned NOT NULL DEFAULT 0,
  `h12` int(10) unsigned NOT NULL DEFAULT 0,
  `h13` int(10) unsigned NOT NULL DEFAULT 0,
  `h14` int(10) unsigned NOT NULL DEFAULT 0,
  `h15` int(10) unsigned NOT NULL DEFAULT 0,
  `h16` int(10) unsigned NOT NULL DEFAULT 0,
  `h17` int(10) unsigned NOT NULL DEFAULT 0,
  `h18` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `Index_id_campo` (`id_campo`)
) ENGINE=MyISAM AUTO_INCREMENT=2126 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `premios`
--

DROP TABLE IF EXISTS `premios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `premios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) NOT NULL DEFAULT ' ',
  `orden` int(11) NOT NULL DEFAULT 1,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL,
  `descripcion` varchar(50) NOT NULL DEFAULT ' ',
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `fecha` (`fecha`)
) ENGINE=MyISAM AUTO_INCREMENT=34965 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `premiosjug`
--

DROP TABLE IF EXISTS `premiosjug`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `premiosjug` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL DEFAULT 0,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `jugadorid` int(11) NOT NULL DEFAULT 0,
  `distancia` double(10,3) NOT NULL DEFAULT 9999.000,
  `fecha` date NOT NULL,
  `ultact` datetime DEFAULT current_timestamp(),
  `premiosjugcol` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `torneoid_2` (`torneoid`,`campo`,`hoyo`,`fecha`,`jugadorid`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `distancia` (`distancia`),
  KEY `cc` (`fecha`),
  KEY `ff` (`jugadorid`)
) ENGINE=MyISAM AUTO_INCREMENT=5385 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profesionales`
--

DROP TABLE IF EXISTS `profesionales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `profesionales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) DEFAULT NULL,
  `clubid` int(11) NOT NULL DEFAULT 1,
  `celular` varchar(10) DEFAULT NULL,
  `correo` varchar(45) DEFAULT NULL,
  `tipoid` int(11) NOT NULL DEFAULT 1,
  `torneoid` int(11) DEFAULT 171,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `putt`
--

DROP TABLE IF EXISTS `putt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `putt` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) NOT NULL DEFAULT ' ',
  `orden` int(11) NOT NULL DEFAULT 1,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `fecha` date NOT NULL,
  `descripcion` varchar(50) NOT NULL DEFAULT ' ',
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `fecha` (`fecha`)
) ENGINE=MyISAM AUTO_INCREMENT=4941 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `puttjug`
--

DROP TABLE IF EXISTS `puttjug`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `puttjug` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `campo` int(11) NOT NULL,
  `hoyo` int(11) NOT NULL DEFAULT 0,
  `premio` int(11) DEFAULT 1,
  `categoria` varchar(45) DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  `categoriaid` int(11) NOT NULL DEFAULT 0,
  `jugadorid` int(11) NOT NULL DEFAULT 0,
  `distancia` double(10,3) NOT NULL DEFAULT 9999.000,
  `fecha` date NOT NULL,
  `ultact` datetime DEFAULT current_timestamp(),
  `premiosjugcol` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `torneoid_2` (`torneoid`,`campo`,`fecha`,`jugadorid`),
  KEY `torneoid` (`torneoid`),
  KEY `campo` (`campo`),
  KEY `hoyo` (`hoyo`),
  KEY `premio` (`premio`),
  KEY `categoria` (`categoria`),
  KEY `orden` (`orden`),
  KEY `categoriaid` (`categoriaid`),
  KEY `distancia` (`distancia`),
  KEY `cc` (`fecha`),
  KEY `ff` (`jugadorid`)
) ENGINE=MyISAM AUTO_INCREMENT=1735 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `registro`
--

DROP TABLE IF EXISTS `registro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro` (
  `reg_id` int(11) NOT NULL AUTO_INCREMENT,
  `reg_id_torneo` int(11) NOT NULL,
  `reg_id_club` int(11) NOT NULL,
  `reg_nombre` varchar(45) NOT NULL,
  `reg_apellido` varchar(45) NOT NULL,
  `reg_genero` varchar(2) NOT NULL,
  `reg_correo` varchar(45) NOT NULL,
  `reg_celular` varchar(15) NOT NULL,
  `reg_pais` varchar(45) NOT NULL,
  `reg_estado` varchar(45) NOT NULL,
  `reg_ciudad` varchar(45) NOT NULL,
  `reg_direccion` varchar(45) NOT NULL,
  `reg_cp` varchar(7) NOT NULL,
  `reg_spei` varchar(45) NOT NULL,
  `reg_handicap` float NOT NULL,
  `reg_categoria` int(11) NOT NULL,
  `reg_club` varchar(45) NOT NULL,
  `reg_mensaje` varchar(100) NOT NULL,
  `reg_cargo` varchar(45) NOT NULL,
  `reg_archivo` longblob DEFAULT NULL,
  `reg_archivo_nombre` varchar(45) NOT NULL,
  `status_pago` int(11) DEFAULT 0,
  `fecharegistro` timestamp NULL DEFAULT current_timestamp(),
  `verificado` int(11) DEFAULT 0,
  `reg_fechanac` date DEFAULT NULL,
  `numghinspei` int(11) DEFAULT NULL,
  `akron_edad` int(11) DEFAULT NULL,
  `akron_talla` varchar(45) DEFAULT NULL,
  `akron_talla_guante` varchar(45) DEFAULT NULL,
  `akron_monto_pago` int(11) DEFAULT 0,
  `akron_codigo` varchar(45) DEFAULT NULL,
  `akron_calzado` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`reg_id`),
  UNIQUE KEY `unic` (`reg_id_torneo`,`reg_nombre`,`reg_apellido`,`reg_correo`)
) ENGINE=InnoDB AUTO_INCREMENT=12926 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `registro_campos`
--

DROP TABLE IF EXISTS `registro_campos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_campos` (
  `reg_id` int(11) NOT NULL AUTO_INCREMENT,
  `reg_id_torneo` int(11) NOT NULL,
  `reg_id_club` int(4) DEFAULT 1,
  `reg_nombre` int(4) DEFAULT 1,
  `reg_apellido` int(4) DEFAULT 1,
  `reg_genero` int(4) DEFAULT 0,
  `reg_correo` int(4) DEFAULT 0,
  `reg_celular` int(4) DEFAULT 0,
  `reg_pais` int(4) DEFAULT 0,
  `reg_estado` int(4) DEFAULT 0,
  `reg_ciudad` int(4) DEFAULT 0,
  `reg_direccion` int(4) DEFAULT 0,
  `reg_cp` int(4) DEFAULT 0,
  `reg_spei` int(4) DEFAULT 0,
  `reg_handicap` int(4) DEFAULT 0,
  `reg_categoria` int(11) NOT NULL,
  `reg_club` int(4) DEFAULT 0,
  `reg_mensaje` int(4) DEFAULT 0,
  `reg_cargo` int(4) DEFAULT 0,
  `reg_archivo` int(4) DEFAULT 0,
  `reg_archivo_nombre` int(4) DEFAULT 0,
  `reg_fechanac` int(4) DEFAULT 0,
  `numghinspei` int(4) DEFAULT 0,
  `akron_edad` int(4) DEFAULT 0,
  `akron_talla` int(4) DEFAULT 0,
  `akron_talla_guante` int(4) DEFAULT 0,
  `akron_monto_pago` int(4) DEFAULT 0,
  `akron_codigo` int(4) DEFAULT 0,
  `akron_calzado` int(4) DEFAULT 0,
  PRIMARY KEY (`reg_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `result_ult_tar`
--

DROP TABLE IF EXISTS `result_ult_tar`;
/*!50001 DROP VIEW IF EXISTS `result_ult_tar`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `result_ult_tar` AS SELECT
 1 AS `jugadorid`,
  1 AS `tarjetaid`,
  1 AS `v2` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `rr_salidas`
--

DROP TABLE IF EXISTS `rr_salidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rr_salidas` (
  `idrr_salidas` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) DEFAULT 1,
  `grupo` varchar(5) DEFAULT NULL,
  `numjugador` int(11) DEFAULT NULL,
  `numsalida` int(11) DEFAULT 1,
  `dia` int(11) DEFAULT NULL,
  `nummatch` int(11) DEFAULT NULL,
  PRIMARY KEY (`idrr_salidas`),
  KEY `d` (`torneoid`),
  KEY `f` (`grupo`),
  KEY `g` (`numsalida`),
  KEY `h` (`numsalida`),
  KEY `j` (`dia`)
) ENGINE=InnoDB AUTO_INCREMENT=986 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rr_salidas_cat`
--

DROP TABLE IF EXISTS `rr_salidas_cat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rr_salidas_cat` (
  `idrr_salidas` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) DEFAULT 1,
  `grupo` varchar(5) DEFAULT NULL,
  `numjugador` int(11) DEFAULT NULL,
  `numsalida` int(11) DEFAULT 1,
  `dia` int(11) DEFAULT NULL,
  `catid` int(11) DEFAULT NULL,
  `nummatch` int(11) DEFAULT NULL,
  PRIMARY KEY (`idrr_salidas`),
  KEY `d` (`torneoid`),
  KEY `f` (`grupo`),
  KEY `h` (`numsalida`),
  KEY `j` (`dia`),
  KEY `catid` (`catid`),
  KEY `g` (`numjugador`)
) ENGINE=InnoDB AUTO_INCREMENT=10489 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rr_salidas_template`
--

DROP TABLE IF EXISTS `rr_salidas_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rr_salidas_template` (
  `idrr_salidas` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) DEFAULT 1,
  `grupo` varchar(5) DEFAULT NULL,
  `numjugador` int(11) DEFAULT NULL,
  `numsalida` int(11) DEFAULT 1,
  `dia` int(11) DEFAULT NULL,
  `nummatch` int(11) DEFAULT NULL,
  PRIMARY KEY (`idrr_salidas`)
) ENGINE=InnoDB AUTO_INCREMENT=290 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `salidagrupo`
--

DROP TABLE IF EXISTS `salidagrupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `salidagrupo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `salidatorneoid` int(11) NOT NULL,
  `horainicio1a` datetime NOT NULL,
  `horafin1a` datetime NOT NULL,
  `horainicio2a` datetime NOT NULL,
  `horafin2a` datetime NOT NULL,
  `categoriaid` int(11) NOT NULL,
  `teesal` varchar(5) NOT NULL,
  `caljuegoid` int(11) NOT NULL DEFAULT 0,
  `numjug` int(11) NOT NULL,
  `numfoursome` int(11) NOT NULL,
  `subgrupo` varchar(1) DEFAULT 'A',
  PRIMARY KEY (`id`),
  KEY `salidatorneoid` (`salidatorneoid`),
  KEY `categoriaid` (`categoriaid`),
  KEY `caljuegoid` (`caljuegoid`),
  KEY `AA` (`subgrupo`)
) ENGINE=MyISAM AUTO_INCREMENT=60768 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `salidas`
--

DROP TABLE IF EXISTS `salidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `salidas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tee` varchar(45) NOT NULL,
  `color` varchar(8) NOT NULL,
  `bgcolor` varchar(12) NOT NULL,
  `genero` varchar(1) DEFAULT 'M',
  PRIMARY KEY (`id`),
  KEY `Index_nombre` (`tee`)
) ENGINE=MyISAM AUTO_INCREMENT=21 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `salidasTorneo`
--

DROP TABLE IF EXISTS `salidasTorneo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `salidasTorneo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `categoriaid` int(11) NOT NULL,
  `diajuegoid` int(11) NOT NULL,
  `h1am` int(11) NOT NULL,
  `h10am` int(11) NOT NULL,
  `h10pm` int(11) NOT NULL,
  `h1pm` int(11) NOT NULL,
  `estatus` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categoriaid_2` (`categoriaid`,`diajuegoid`),
  KEY `categoriaid` (`categoriaid`),
  KEY `diajuegoid` (`diajuegoid`),
  KEY `h1am` (`h1am`),
  KEY `h10am` (`h10am`),
  KEY `h10pm` (`h10pm`),
  KEY `h1pm` (`h1pm`)
) ENGINE=MyISAM AUTO_INCREMENT=236 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sino`
--

DROP TABLE IF EXISTS `sino`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sino` (
  `idsino` int(11) NOT NULL,
  `sinocol` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`idsino`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `skeen_grupo`
--

DROP TABLE IF EXISTS `skeen_grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `skeen_grupo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `categorias` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`)
) ENGINE=MyISAM AUTO_INCREMENT=33 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `socios`
--

DROP TABLE IF EXISTS `socios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `socios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) DEFAULT NULL,
  `clubid` int(11) NOT NULL DEFAULT 1,
  `celular` varchar(10) DEFAULT NULL,
  `correo` varchar(45) DEFAULT NULL,
  `tipoid` int(11) NOT NULL DEFAULT 1,
  `torneoid` int(11) DEFAULT 171,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `states`
--

DROP TABLE IF EXISTS `states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `states` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_country` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_states_countries` (`id_country`),
  CONSTRAINT `fk_states_countries` FOREIGN KEY (`id_country`) REFERENCES `countries` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2204 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tarjetas`
--

DROP TABLE IF EXISTS `tarjetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarjetas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `campoid` int(10) unsigned zerofill NOT NULL DEFAULT 0000000000,
  `h1` int(10) unsigned NOT NULL DEFAULT 0,
  `h2` int(10) unsigned NOT NULL DEFAULT 0,
  `h3` int(10) unsigned NOT NULL DEFAULT 0,
  `h4` int(10) unsigned NOT NULL DEFAULT 0,
  `h5` int(10) unsigned NOT NULL DEFAULT 0,
  `h6` int(10) unsigned NOT NULL DEFAULT 0,
  `h7` int(10) unsigned NOT NULL DEFAULT 0,
  `h8` int(10) unsigned NOT NULL DEFAULT 0,
  `h9` int(10) unsigned NOT NULL DEFAULT 0,
  `h10` int(10) unsigned NOT NULL DEFAULT 0,
  `h11` int(10) unsigned NOT NULL DEFAULT 0,
  `h12` int(10) unsigned NOT NULL DEFAULT 0,
  `h13` int(10) unsigned NOT NULL DEFAULT 0,
  `h14` int(10) unsigned NOT NULL DEFAULT 0,
  `h15` int(10) unsigned NOT NULL DEFAULT 0,
  `h16` int(10) unsigned NOT NULL DEFAULT 0,
  `h17` int(10) unsigned NOT NULL DEFAULT 0,
  `h18` int(10) unsigned NOT NULL DEFAULT 0,
  `h1_a` int(10) NOT NULL DEFAULT 0,
  `h2_a` int(10) NOT NULL DEFAULT 0,
  `h3_a` int(10) NOT NULL DEFAULT 0,
  `h4_a` int(10) NOT NULL DEFAULT 0,
  `h5_a` int(10) NOT NULL DEFAULT 0,
  `h6_a` int(10) NOT NULL DEFAULT 0,
  `h7_a` int(10) NOT NULL DEFAULT 0,
  `h8_a` int(10) NOT NULL DEFAULT 0,
  `h9_a` int(10) NOT NULL DEFAULT 0,
  `h10_a` int(10) NOT NULL DEFAULT 0,
  `h11_a` int(10) NOT NULL DEFAULT 0,
  `h12_a` int(10) NOT NULL DEFAULT 0,
  `h13_a` int(10) NOT NULL DEFAULT 0,
  `h14_a` int(10) NOT NULL DEFAULT 0,
  `h15_a` int(10) NOT NULL DEFAULT 0,
  `h16_a` int(10) NOT NULL DEFAULT 0,
  `h17_a` int(10) NOT NULL DEFAULT 0,
  `h18_a` int(10) NOT NULL DEFAULT 0,
  `jugadorid` int(10) unsigned NOT NULL DEFAULT 0,
  `fecha_cap` datetime NOT NULL DEFAULT current_timestamp(),
  `tee_salida` int(10) unsigned NOT NULL DEFAULT 2,
  `color_tee` varchar(15) NOT NULL DEFAULT 'BLANCAS',
  `SO` int(10) unsigned NOT NULL DEFAULT 0,
  `SA` int(10) unsigned NOT NULL DEFAULT 0,
  `dif` double NOT NULL DEFAULT 0,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_juego` date NOT NULL DEFAULT '2000-01-01',
  `tipo` char(1) NOT NULL DEFAULT 'N',
  `salidagrupoid` int(10) unsigned NOT NULL DEFAULT 0,
  `categoriaid` bigint(20) NOT NULL DEFAULT 0,
  `utiliza` int(10) unsigned NOT NULL DEFAULT 0,
  `slope` double NOT NULL DEFAULT 113,
  `rating` double NOT NULL DEFAULT 72,
  `torneoid` int(11) NOT NULL DEFAULT 0,
  `orden` int(11) NOT NULL DEFAULT 0,
  `estatus` varchar(1) NOT NULL DEFAULT 'N',
  `arso` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
  `arsa` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
  `arsap` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
  `arvtj` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
  `arsopar` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
  `arsapar` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
  `arvtjpar` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
  `go` double DEFAULT 0,
  `nummatch` int(11) DEFAULT 0,
  `gana` int(11) DEFAULT 0,
  `arstbgross` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
  `totstbgross` int(11) DEFAULT 0,
  `ventajas` varchar(145) DEFAULT '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
  `parcampo` int(11) DEFAULT NULL,
  `parcampohoyo` varchar(145) DEFAULT NULL,
  `statlsc` int(11) DEFAULT 0,
  `vtjasgo` varchar(145) DEFAULT NULL,
  `hog` varchar(45) DEFAULT '0',
  `hcampo` int(11) DEFAULT 0,
  `tagid` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `Index_id_campo` (`campoid`),
  KEY `Index_id_jug` (`jugadorid`),
  KEY `Index_feca_cap` (`fecha_cap`),
  KEY `Index_tee` (`tee_salida`),
  KEY `Index_6` (`color_tee`),
  KEY `Index_dif` (`dif`),
  KEY `Index_estado` (`estado`),
  KEY `Index_fecha_juego` (`fecha_juego`),
  KEY `tipo` (`tipo`),
  KEY `index_club_cap` (`salidagrupoid`),
  KEY `id_tar_club` (`categoriaid`),
  KEY `Index_13` (`utiliza`),
  KEY `orden` (`orden`),
  KEY `s` (`statlsc`),
  KEY `T` (`nummatch`)
) ENGINE=MyISAM AUTO_INCREMENT=548509 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipotorneo`
--

DROP TABLE IF EXISTS `tipotorneo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipotorneo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sistema` varchar(25) NOT NULL,
  `formato` varchar(20) NOT NULL,
  `estilo` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `torneo`
--

DROP TABLE IF EXISTS `torneo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `torneo` (
  `torneo_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `fecha_ini` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `fecha_hand` date NOT NULL,
  `fecha_cierre` varchar(10) DEFAULT '0000-00-00',
  `status` varchar(1) NOT NULL DEFAULT 'A',
  `club_id` int(10) unsigned NOT NULL DEFAULT 715,
  `logo` varchar(200) NOT NULL DEFAULT ' ',
  `formato` varchar(45) NOT NULL DEFAULT 'INDIVIDUAL',
  `estilo` varchar(45) NOT NULL DEFAULT 'PERSONAL',
  `correotorne` varchar(145) NOT NULL DEFAULT '@',
  `sistemajuego` varchar(45) NOT NULL DEFAULT 'STROKE PLAY/STABLEFORD',
  `telefono` varchar(45) NOT NULL DEFAULT ' ',
  `tipotorneo` int(11) NOT NULL DEFAULT 1,
  `varioscampos` int(11) NOT NULL DEFAULT 0,
  `oyesacum` int(11) NOT NULL DEFAULT 0,
  `oyesacumgpo` int(11) NOT NULL DEFAULT 0,
  `oyesnumprem` int(11) NOT NULL DEFAULT 5,
  `horapm` int(11) NOT NULL DEFAULT 12,
  `imagen_gif` varchar(150) NOT NULL DEFAULT ' ',
  `skeen_porcet1` int(11) NOT NULL DEFAULT 0,
  `skeen_porcet2` int(11) NOT NULL DEFAULT 0,
  `regla1312` int(11) NOT NULL DEFAULT 0,
  `color_cinta` varchar(6) DEFAULT 'A60282',
  `oyesprese` int(11) NOT NULL DEFAULT 0,
  `campos` varchar(45) DEFAULT NULL,
  `camposformulario` varchar(45) DEFAULT '1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1',
  `numghinspei` varchar(45) DEFAULT NULL,
  `logo_cuentadeposito` varchar(200) NOT NULL DEFAULT ' ',
  PRIMARY KEY (`torneo_id`),
  KEY `tipotorneo` (`tipotorneo`)
) ENGINE=MyISAM AUTO_INCREMENT=342 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`tomas.obeso`@`%`*/ /*!50003 TRIGGER `torneos`.`torneo_AFTER_INSERT` AFTER INSERT ON `torneo` FOR EACH ROW
BEGIN
insert into valorstable (torneoid, difpar, valor) values
(new.torneo_id,	3 ,0 ),
(new.torneo_id,	2 ,0 ),
(new.torneo_id,	1 ,1 ),
(new.torneo_id,	0 ,2 ),
(new.torneo_id,	-1 ,3 ),
(new.torneo_id,	-2 ,4 ),
(new.torneo_id,	-3 ,5 ),
(new.torneo_id,	-4 ,0 ),
(new.torneo_id,	-5 ,0 ),
(new.torneo_id,	-6 ,0 );
#insert los campos del registro
insert into campos_registro (nombre,torneoid,registro1,registro2,orden,nom_display) 
values ('reg_id_torneo',new.torneo_id,0,0,1,'id_torneo'),
('reg_id_club',new.torneo_id,0,0,2,'id_club'),
('reg_nombre',new.torneo_id,1,1,3,'nombre'),
('reg_apellido',new.torneo_id,1,1,4,'apellido'),
('reg_genero',new.torneo_id,1,1,5,'genero'),
('reg_correo',new.torneo_id,1,1,6,'correo'),
('reg_celular',new.torneo_id,1,1,7,'celular'),
('reg_pais',new.torneo_id,0,0,8,'pais'),
('reg_estado',new.torneo_id,0,0,9,'estado'),
('reg_ciudad',new.torneo_id,0,0,10,'ciudad'),
('reg_direccion',new.torneo_id,0,0,11,'direccion'),
('reg_cp',new.torneo_id,0,0,12,'cp'),
('reg_spei',new.torneo_id,0,0,13,'spei'),
('reg_handicap',new.torneo_id,1,1,14,'handicap'),
('reg_categoria',new.torneo_id,1,1,15,'categoria'),
('reg_club',new.torneo_id,1,1,16,'club'),
('reg_mensaje',new.torneo_id,0,0,17,'mensaje'),
('reg_cargo',new.torneo_id,0,0,18,'cargo'),
('reg_archivo',new.torneo_id,0,0,19,'archivo'),
('reg_archivo_nombre',new.torneo_id,0,0,20,'archivo_nombre'),
('status_pago',new.torneo_id,0,0,21,'status_pago'),
('reg_fechanac',new.torneo_id,0,0,22,'fechanac'),
('numghinspei',new.torneo_id,0,0,23,'numghinspei'),
('akron_edad',new.torneo_id,1,1,24,'edad'),
('akron_talla',new.torneo_id,0,0,25,'talla'),
('akron_talla_guante',new.torneo_id,0,0,26,'talla_guante'),
('akron_monto_pago',new.torneo_id,0,0,27,'monto_pago'),
('akron_codigo',new.torneo_id,0,0,28,'codigo'),
('akron_calzado',new.torneo_id,0,0,29,'calzado');

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario` varchar(15) NOT NULL,
  `pwd` varchar(100) NOT NULL,
  `clubid` int(11) NOT NULL,
  `tipo` int(11) NOT NULL,
  `torneoid` int(11) NOT NULL,
  `estatus` varchar(10) NOT NULL DEFAULT 'ACTIVO',
  `nombre` varchar(30) NOT NULL,
  `desde` date DEFAULT NULL,
  `hasta` date DEFAULT NULL,
  `ultent` datetime NOT NULL,
  `mysqlusu` varchar(45) DEFAULT '',
  `correo_electronico` varchar(45) DEFAULT '',
  `torneos` varchar(55) DEFAULT NULL,
  `activo` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`),
  KEY `clubid` (`clubid`),
  KEY `estatus` (`estatus`),
  KEY `tipo` (`tipo`)
) ENGINE=MyISAM AUTO_INCREMENT=91 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usutipo`
--

DROP TABLE IF EXISTS `usutipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usutipo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(20) NOT NULL,
  `opciones` varchar(50) NOT NULL,
  `imagen` varchar(50) NOT NULL,
  `smenu0` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0',
  `smenu1` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0',
  `smenu2` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0',
  `smenu3` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0',
  `smenu4` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0',
  `smenu5` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0',
  `smenu6` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0',
  `smenu7` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0',
  `smenu8` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0',
  `smenu9` varchar(45) DEFAULT '0,0,0,0,0,0,0,0,0,0',
  `header` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `v_approach`
--

DROP TABLE IF EXISTS `v_approach`;
/*!50001 DROP VIEW IF EXISTS `v_approach`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_approach` AS SELECT
 1 AS `torneoid`,
  1 AS `campo`,
  1 AS `categoriaid`,
  1 AS `descripcion`,
  1 AS `premio` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_approach_jugadores`
--

DROP TABLE IF EXISTS `v_approach_jugadores`;
/*!50001 DROP VIEW IF EXISTS `v_approach_jugadores`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_approach_jugadores` AS SELECT
 1 AS `torneoid`,
  1 AS `campo`,
  1 AS `hoyo`,
  1 AS `premio`,
  1 AS `jugadorid`,
  1 AS `nombre`,
  1 AS `apellido`,
  1 AS `club`,
  1 AS `estatus`,
  1 AS `categoriaid`,
  1 AS `categoria`,
  1 AS `grupoid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_approachjug`
--

DROP TABLE IF EXISTS `v_approachjug`;
/*!50001 DROP VIEW IF EXISTS `v_approachjug`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_approachjug` AS SELECT
 1 AS `id`,
  1 AS `campo`,
  1 AS `hoyo`,
  1 AS `premio`,
  1 AS `fecha`,
  1 AS `jugador`,
  1 AS `categoria`,
  1 AS `distancia`,
  1 AS `jugadorid`,
  1 AS `torneoid`,
  1 AS `descripcion` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_approachunico`
--

DROP TABLE IF EXISTS `v_approachunico`;
/*!50001 DROP VIEW IF EXISTS `v_approachunico`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_approachunico` AS SELECT
 1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `mindistancia` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_aproachunico`
--

DROP TABLE IF EXISTS `v_aproachunico`;
/*!50001 DROP VIEW IF EXISTS `v_aproachunico`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_aproachunico` AS SELECT
 1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `mindistancia` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_caljgo_salgpo`
--

DROP TABLE IF EXISTS `v_caljgo_salgpo`;
/*!50001 DROP VIEW IF EXISTS `v_caljgo_salgpo`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_caljgo_salgpo` AS SELECT
 1 AS `caljuegoid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_campeon_gross`
--

DROP TABLE IF EXISTS `v_campeon_gross`;
/*!50001 DROP VIEW IF EXISTS `v_campeon_gross`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_campeon_gross` AS SELECT
 1 AS `jugadorid`,
  1 AS `categoriaid`,
  1 AS `jugador`,
  1 AS `estatjug`,
  1 AS `club`,
  1 AS `campgross`,
  1 AS `muertesubita`,
  1 AS `grupoid`,
  1 AS `cd1`,
  1 AS `cd2`,
  1 AS `cd3`,
  1 AS `cd4`,
  1 AS `cd5`,
  1 AS `cd6`,
  1 AS `neto`,
  1 AS `gross`,
  1 AS `logojug` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_campeon_gross_stoke`
--

DROP TABLE IF EXISTS `v_campeon_gross_stoke`;
/*!50001 DROP VIEW IF EXISTS `v_campeon_gross_stoke`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_campeon_gross_stoke` AS SELECT
 1 AS `jugadorid`,
  1 AS `categoriaid`,
  1 AS `jugador`,
  1 AS `estatjug`,
  1 AS `club`,
  1 AS `campgross`,
  1 AS `muertesubita`,
  1 AS `grupoid`,
  1 AS `cd1`,
  1 AS `cd2`,
  1 AS `cd3`,
  1 AS `cd4`,
  1 AS `cd5`,
  1 AS `cd6`,
  1 AS `neto`,
  1 AS `gross`,
  1 AS `logojug` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_cd_ulttar`
--

DROP TABLE IF EXISTS `v_cd_ulttar`;
/*!50001 DROP VIEW IF EXISTS `v_cd_ulttar`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_cd_ulttar` AS SELECT
 1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `c1`,
  1 AS `c2`,
  1 AS `c3`,
  1 AS `c4`,
  1 AS `c5`,
  1 AS `c6` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_cd_ulttar_sa`
--

DROP TABLE IF EXISTS `v_cd_ulttar_sa`;
/*!50001 DROP VIEW IF EXISTS `v_cd_ulttar_sa`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_cd_ulttar_sa` AS SELECT
 1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `c1`,
  1 AS `c2`,
  1 AS `c3`,
  1 AS `c4`,
  1 AS `c5`,
  1 AS `c6` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_cd_ulttar_so`
--

DROP TABLE IF EXISTS `v_cd_ulttar_so`;
/*!50001 DROP VIEW IF EXISTS `v_cd_ulttar_so`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_cd_ulttar_so` AS SELECT
 1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `c1`,
  1 AS `c2`,
  1 AS `c3`,
  1 AS `c4`,
  1 AS `c5`,
  1 AS `c6` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_clubs_torneo`
--

DROP TABLE IF EXISTS `v_clubs_torneo`;
/*!50001 DROP VIEW IF EXISTS `v_clubs_torneo`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_clubs_torneo` AS SELECT
 1 AS `id`,
  1 AS `torneoid`,
  1 AS `clubid`,
  1 AS `nombre` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_diasjgo`
--

DROP TABLE IF EXISTS `v_diasjgo`;
/*!50001 DROP VIEW IF EXISTS `v_diasjgo`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_diasjgo` AS SELECT
 1 AS `torneoid`,
  1 AS `categoria`,
  1 AS `INICIA`,
  1 AS `TERMINA`,
  1 AS `diasjgo`,
  1 AS `categoria_id` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_diasjgo_categoria`
--

DROP TABLE IF EXISTS `v_diasjgo_categoria`;
/*!50001 DROP VIEW IF EXISTS `v_diasjgo_categoria`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_diasjgo_categoria` AS SELECT
 1 AS `categoriaid`,
  1 AS `diajuegoid`,
  1 AS `fecha` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_difpar_jugador`
--

DROP TABLE IF EXISTS `v_difpar_jugador`;
/*!50001 DROP VIEW IF EXISTS `v_difpar_jugador`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_difpar_jugador` AS SELECT
 1 AS `jugadorid`,
  1 AS `difpar` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_difpar_jugadorGO`
--

DROP TABLE IF EXISTS `v_difpar_jugadorGO`;
/*!50001 DROP VIEW IF EXISTS `v_difpar_jugadorGO`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_difpar_jugadorGO` AS SELECT
 1 AS `jugadorid`,
  1 AS `difpar` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_difpar_jugador_neto`
--

DROP TABLE IF EXISTS `v_difpar_jugador_neto`;
/*!50001 DROP VIEW IF EXISTS `v_difpar_jugador_neto`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_difpar_jugador_neto` AS SELECT
 1 AS `jugadorid`,
  1 AS `difpar` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_difpar_jugador_netof`
--

DROP TABLE IF EXISTS `v_difpar_jugador_netof`;
/*!50001 DROP VIEW IF EXISTS `v_difpar_jugador_netof`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_difpar_jugador_netof` AS SELECT
 1 AS `jugadorid`,
  1 AS `difpar` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_difpar_tarjeta`
--

DROP TABLE IF EXISTS `v_difpar_tarjeta`;
/*!50001 DROP VIEW IF EXISTS `v_difpar_tarjeta`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_difpar_tarjeta` AS SELECT
 1 AS `tarjetaid`,
  1 AS `difpar` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_difpar_tarjeta_stb`
--

DROP TABLE IF EXISTS `v_difpar_tarjeta_stb`;
/*!50001 DROP VIEW IF EXISTS `v_difpar_tarjeta_stb`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_difpar_tarjeta_stb` AS SELECT
 1 AS `tarjetaid`,
  1 AS `difpar` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_difpar_ulttarjeta`
--

DROP TABLE IF EXISTS `v_difpar_ulttarjeta`;
/*!50001 DROP VIEW IF EXISTS `v_difpar_ulttarjeta`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_difpar_ulttarjeta` AS SELECT
 1 AS `tarjetaid`,
  1 AS `jugadorid`,
  1 AS `avance`,
  1 AS `difpar_ulttar`,
  1 AS `sa` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_difpar_ulttarjeta_neto`
--

DROP TABLE IF EXISTS `v_difpar_ulttarjeta_neto`;
/*!50001 DROP VIEW IF EXISTS `v_difpar_ulttarjeta_neto`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_difpar_ulttarjeta_neto` AS SELECT
 1 AS `tarjetaid`,
  1 AS `jugadorid`,
  1 AS `avance`,
  1 AS `difpar_ulttar`,
  1 AS `sa` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_difpar_ulttarjeta_stb`
--

DROP TABLE IF EXISTS `v_difpar_ulttarjeta_stb`;
/*!50001 DROP VIEW IF EXISTS `v_difpar_ulttarjeta_stb`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_difpar_ulttarjeta_stb` AS SELECT
 1 AS `tarjetaid`,
  1 AS `jugadorid`,
  1 AS `avance`,
  1 AS `difpar_ulttar`,
  1 AS `sa` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_difpar_ulttarjetago`
--

DROP TABLE IF EXISTS `v_difpar_ulttarjetago`;
/*!50001 DROP VIEW IF EXISTS `v_difpar_ulttarjetago`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_difpar_ulttarjetago` AS SELECT
 1 AS `tarjetaid`,
  1 AS `jugadorid`,
  1 AS `avance`,
  1 AS `difpar_ulttar`,
  1 AS `sa` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_difpar_ulttarjetasa`
--

DROP TABLE IF EXISTS `v_difpar_ulttarjetasa`;
/*!50001 DROP VIEW IF EXISTS `v_difpar_ulttarjetasa`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_difpar_ulttarjetasa` AS SELECT
 1 AS `tarjetaid`,
  1 AS `difpar` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_dribver`
--

DROP TABLE IF EXISTS `v_dribver`;
/*!50001 DROP VIEW IF EXISTS `v_dribver`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_dribver` AS SELECT
 1 AS `torneoid`,
  1 AS `campo`,
  1 AS `categoriaid`,
  1 AS `descripcion` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_driver`
--

DROP TABLE IF EXISTS `v_driver`;
/*!50001 DROP VIEW IF EXISTS `v_driver`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_driver` AS SELECT
 1 AS `torneoid`,
  1 AS `campo`,
  1 AS `categoriaid`,
  1 AS `descripcion`,
  1 AS `premio` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_driver_jugadores`
--

DROP TABLE IF EXISTS `v_driver_jugadores`;
/*!50001 DROP VIEW IF EXISTS `v_driver_jugadores`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_driver_jugadores` AS SELECT
 1 AS `torneoid`,
  1 AS `campo`,
  1 AS `hoyo`,
  1 AS `premio`,
  1 AS `jugadorid`,
  1 AS `nombre`,
  1 AS `apellido`,
  1 AS `club`,
  1 AS `estatus`,
  1 AS `categoriaid`,
  1 AS `categoria`,
  1 AS `grupoid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_driverjug`
--

DROP TABLE IF EXISTS `v_driverjug`;
/*!50001 DROP VIEW IF EXISTS `v_driverjug`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_driverjug` AS SELECT
 1 AS `id`,
  1 AS `campo`,
  1 AS `hoyo`,
  1 AS `premio`,
  1 AS `fecha`,
  1 AS `jugador`,
  1 AS `categoria`,
  1 AS `distancia`,
  1 AS `jugadorid`,
  1 AS `torneoid`,
  1 AS `descripcion` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_driverjugp`
--

DROP TABLE IF EXISTS `v_driverjugp`;
/*!50001 DROP VIEW IF EXISTS `v_driverjugp`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_driverjugp` AS SELECT
 1 AS `id`,
  1 AS `campo`,
  1 AS `hoyo`,
  1 AS `premio`,
  1 AS `fecha`,
  1 AS `jugador`,
  1 AS `categoria`,
  1 AS `distancia`,
  1 AS `jugadorid`,
  1 AS `torneoid`,
  1 AS `descripcion` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_driverp`
--

DROP TABLE IF EXISTS `v_driverp`;
/*!50001 DROP VIEW IF EXISTS `v_driverp`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_driverp` AS SELECT
 1 AS `torneoid`,
  1 AS `campo`,
  1 AS `categoriaid`,
  1 AS `descripcion`,
  1 AS `premio` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_driverunico`
--

DROP TABLE IF EXISTS `v_driverunico`;
/*!50001 DROP VIEW IF EXISTS `v_driverunico`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_driverunico` AS SELECT
 1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `mindistancia` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_driverunicop`
--

DROP TABLE IF EXISTS `v_driverunicop`;
/*!50001 DROP VIEW IF EXISTS `v_driverunicop`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_driverunicop` AS SELECT
 1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `mindistancia` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_equipo_ed`
--

DROP TABLE IF EXISTS `v_equipo_ed`;
/*!50001 DROP VIEW IF EXISTS `v_equipo_ed`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_equipo_ed` AS SELECT
 1 AS `idelimin_salidas`,
  1 AS `categoriaid`,
  1 AS `torneoid`,
  1 AS `fecha`,
  1 AS `clubid`,
  1 AS `club`,
  1 AS `jugador`,
  1 AS `posicion`,
  1 AS `categoria`,
  1 AS `dia`,
  1 AS `salida`,
  1 AS `pl_grupo`,
  1 AS `sl_grupo`,
  1 AS `matchx`,
  1 AS `posicionp`,
  1 AS `posicions`,
  1 AS `hoyo`,
  1 AS `resultado`,
  1 AS `logojug`,
  1 AS `gano`,
  1 AS `postabla` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_estatorneo`
--

DROP TABLE IF EXISTS `v_estatorneo`;
/*!50001 DROP VIEW IF EXISTS `v_estatorneo`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_estatorneo` AS SELECT
 1 AS `numjugador`,
  1 AS `nombre`,
  1 AS `apellido`,
  1 AS `indexjgo`,
  1 AS `round((a.indexjgo*.8),0)`,
  1 AS `torneoid`,
  1 AS `categoria`,
  1 AS `club` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_familia`
--

DROP TABLE IF EXISTS `v_familia`;
/*!50001 DROP VIEW IF EXISTS `v_familia`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_familia` AS SELECT
 1 AS `k`,
  1 AS `v` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_gpsult`
--

DROP TABLE IF EXISTS `v_gpsult`;
/*!50001 DROP VIEW IF EXISTS `v_gpsult`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_gpsult` AS SELECT
 1 AS `salidaid`,
  1 AS `id` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_handicap_gogo`
--

DROP TABLE IF EXISTS `v_handicap_gogo`;
/*!50001 DROP VIEW IF EXISTS `v_handicap_gogo`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_handicap_gogo` AS SELECT
 1 AS `torneoid`,
  1 AS `numjugador`,
  1 AS `categoriaid`,
  1 AS `id`,
  1 AS `formato`,
  1 AS `hcampo`,
  1 AS `x`,
  1 AS `hcampmin`,
  1 AS `hcampo1`,
  1 AS `hcampmax`,
  1 AS `hcampo2`,
  1 AS `hcpfintot`,
  1 AS `hcampox` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_horariox`
--

DROP TABLE IF EXISTS `v_horariox`;
/*!50001 DROP VIEW IF EXISTS `v_horariox`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_horariox` AS SELECT
 1 AS `id`,
  1 AS `horainicio1a`,
  1 AS `teesal`,
  1 AS `numjug`,
  1 AS `catjugador`,
  1 AS `categoriaid`,
  1 AS `fecha`,
  1 AS `campo`,
  1 AS `agrupo`,
  1 AS `torneoid`,
  1 AS `pwd` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_juegos`
--

DROP TABLE IF EXISTS `v_juegos`;
/*!50001 DROP VIEW IF EXISTS `v_juegos`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_juegos` AS SELECT
 1 AS `torneoid`,
  1 AS `campo`,
  1 AS `premio`,
  1 AS `numpremios`,
  1 AS `descripcion`,
  1 AS `tipo` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_jugadores`
--

DROP TABLE IF EXISTS `v_jugadores`;
/*!50001 DROP VIEW IF EXISTS `v_jugadores`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_jugadores` AS SELECT
 1 AS `torneoid`,
  1 AS `grupoid`,
  1 AS `jugadorid`,
  1 AS `pareja`,
  1 AS `categoriaid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_jugadores_parejas`
--

DROP TABLE IF EXISTS `v_jugadores_parejas`;
/*!50001 DROP VIEW IF EXISTS `v_jugadores_parejas`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_jugadores_parejas` AS SELECT
 1 AS `grupoid`,
  1 AS `torneoid`,
  1 AS `categoriaid`,
  1 AS `jugadorid`,
  1 AS `jugadorid2`,
  1 AS `indexjgo`,
  1 AS `indexjgoprom`,
  1 AS `pareja` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_jugxcat`
--

DROP TABLE IF EXISTS `v_jugxcat`;
/*!50001 DROP VIEW IF EXISTS `v_jugxcat`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_jugxcat` AS SELECT
 1 AS `torneoid`,
  1 AS `categoriaid`,
  1 AS `totjug` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_jugxcat2`
--

DROP TABLE IF EXISTS `v_jugxcat2`;
/*!50001 DROP VIEW IF EXISTS `v_jugxcat2`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_jugxcat2` AS SELECT
 1 AS `torneoid`,
  1 AS `categoriaid`,
  1 AS `totjug`,
  1 AS `categoria` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_lista_clubs`
--

DROP TABLE IF EXISTS `v_lista_clubs`;
/*!50001 DROP VIEW IF EXISTS `v_lista_clubs`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_lista_clubs` AS SELECT
 1 AS `k`,
  1 AS `v` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_lista_jug`
--

DROP TABLE IF EXISTS `v_lista_jug`;
/*!50001 DROP VIEW IF EXISTS `v_lista_jug`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_lista_jug` AS SELECT
 1 AS `id`,
  1 AS `torneoid`,
  1 AS `numjugador`,
  1 AS `nombre`,
  1 AS `apellido`,
  1 AS `sexo`,
  1 AS `club`,
  1 AS `categoria`,
  1 AS `grupoid`,
  1 AS `estatus`,
  1 AS `categoriaid`,
  1 AS `clubid`,
  1 AS `logoclub`,
  1 AS `cd1`,
  1 AS `cd2`,
  1 AS `cd3`,
  1 AS `cd4`,
  1 AS `cd5`,
  1 AS `cd6`,
  1 AS `muertesubita` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_lista_jugadores`
--

DROP TABLE IF EXISTS `v_lista_jugadores`;
/*!50001 DROP VIEW IF EXISTS `v_lista_jugadores`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_lista_jugadores` AS SELECT
 1 AS `k`,
  1 AS `v`,
  1 AS `torneoid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_lista_pro`
--

DROP TABLE IF EXISTS `v_lista_pro`;
/*!50001 DROP VIEW IF EXISTS `v_lista_pro`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_lista_pro` AS SELECT
 1 AS `k`,
  1 AS `v` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_lista_tipos`
--

DROP TABLE IF EXISTS `v_lista_tipos`;
/*!50001 DROP VIEW IF EXISTS `v_lista_tipos`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_lista_tipos` AS SELECT
 1 AS `k`,
  1 AS `v` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_livesacor_pos`
--

DROP TABLE IF EXISTS `v_livesacor_pos`;
/*!50001 DROP VIEW IF EXISTS `v_livesacor_pos`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_livesacor_pos` AS SELECT
 1 AS `categoriaid`,
  1 AS `jugadorid`,
  1 AS `so`,
  1 AS `rdn`,
  1 AS `rondas`,
  1 AS `maxid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_matchs`
--

DROP TABLE IF EXISTS `v_matchs`;
/*!50001 DROP VIEW IF EXISTS `v_matchs`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_matchs` AS SELECT
 1 AS `tarjetaid`,
  1 AS `categoriaid`,
  1 AS `fecha_juego`,
  1 AS `jugid`,
  1 AS `nummatch`,
  1 AS `grupoid`,
  1 AS `vvswho`,
  1 AS `result` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_mejorscorejugp`
--

DROP TABLE IF EXISTS `v_mejorscorejugp`;
/*!50001 DROP VIEW IF EXISTS `v_mejorscorejugp`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_mejorscorejugp` AS SELECT
 1 AS `id`,
  1 AS `campo`,
  1 AS `hoyo`,
  1 AS `premio`,
  1 AS `fecha`,
  1 AS `jugador`,
  1 AS `categoria`,
  1 AS `distancia`,
  1 AS `jugadorid`,
  1 AS `torneoid`,
  1 AS `descripcion`,
  1 AS `logojug`,
  1 AS `categoriaid`,
  1 AS `abreviatura` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_oyesunicas`
--

DROP TABLE IF EXISTS `v_oyesunicas`;
/*!50001 DROP VIEW IF EXISTS `v_oyesunicas`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_oyesunicas` AS SELECT
 1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `mindistancia` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_oyesunicasxoyo`
--

DROP TABLE IF EXISTS `v_oyesunicasxoyo`;
/*!50001 DROP VIEW IF EXISTS `v_oyesunicasxoyo`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_oyesunicasxoyo` AS SELECT
 1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `hoyo`,
  1 AS `mindistancia` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_oyesx`
--

DROP TABLE IF EXISTS `v_oyesx`;
/*!50001 DROP VIEW IF EXISTS `v_oyesx`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_oyesx` AS SELECT
 1 AS `torneoid`,
  1 AS `campo`,
  1 AS `categoriaid`,
  1 AS `descripcion` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_oyesxjug`
--

DROP TABLE IF EXISTS `v_oyesxjug`;
/*!50001 DROP VIEW IF EXISTS `v_oyesxjug`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_oyesxjug` AS SELECT
 1 AS `id`,
  1 AS `campo`,
  1 AS `hoyo`,
  1 AS `premio`,
  1 AS `fecha`,
  1 AS `jugador`,
  1 AS `categoria`,
  1 AS `distancia`,
  1 AS `jugadorid`,
  1 AS `torneoid`,
  1 AS `descripcion` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_parcampo`
--

DROP TABLE IF EXISTS `v_parcampo`;
/*!50001 DROP VIEW IF EXISTS `v_parcampo`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_parcampo` AS SELECT
 1 AS `campoid`,
  1 AS `salidaid`,
  1 AS `par` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_prem_jugadores`
--

DROP TABLE IF EXISTS `v_prem_jugadores`;
/*!50001 DROP VIEW IF EXISTS `v_prem_jugadores`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_prem_jugadores` AS SELECT
 1 AS `torneoid`,
  1 AS `campo`,
  1 AS `hoyo`,
  1 AS `premio`,
  1 AS `jugadorid`,
  1 AS `nombre`,
  1 AS `apellido`,
  1 AS `club`,
  1 AS `estatus`,
  1 AS `categoriaid`,
  1 AS `categoria`,
  1 AS `grupoid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_prem_repet_torreon`
--

DROP TABLE IF EXISTS `v_prem_repet_torreon`;
/*!50001 DROP VIEW IF EXISTS `v_prem_repet_torreon`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_prem_repet_torreon` AS SELECT
 1 AS `hoyo`,
  1 AS `premio`,
  1 AS `categoria`,
  1 AS `tot`,
  1 AS `id` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_premjug`
--

DROP TABLE IF EXISTS `v_premjug`;
/*!50001 DROP VIEW IF EXISTS `v_premjug`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_premjug` AS SELECT
 1 AS `id`,
  1 AS `campo`,
  1 AS `hoyo`,
  1 AS `premio`,
  1 AS `fecha`,
  1 AS `jugador`,
  1 AS `categoria`,
  1 AS `distancia`,
  1 AS `jugadorid`,
  1 AS `torneoid`,
  1 AS `descripcion` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_putt`
--

DROP TABLE IF EXISTS `v_putt`;
/*!50001 DROP VIEW IF EXISTS `v_putt`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_putt` AS SELECT
 1 AS `torneoid`,
  1 AS `campo`,
  1 AS `categoriaid`,
  1 AS `descripcion`,
  1 AS `premio` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_putt_jugadores`
--

DROP TABLE IF EXISTS `v_putt_jugadores`;
/*!50001 DROP VIEW IF EXISTS `v_putt_jugadores`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_putt_jugadores` AS SELECT
 1 AS `torneoid`,
  1 AS `campo`,
  1 AS `hoyo`,
  1 AS `premio`,
  1 AS `jugadorid`,
  1 AS `nombre`,
  1 AS `apellido`,
  1 AS `club`,
  1 AS `estatus`,
  1 AS `categoriaid`,
  1 AS `categoria`,
  1 AS `grupoid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_puttjug`
--

DROP TABLE IF EXISTS `v_puttjug`;
/*!50001 DROP VIEW IF EXISTS `v_puttjug`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_puttjug` AS SELECT
 1 AS `id`,
  1 AS `campo`,
  1 AS `hoyo`,
  1 AS `premio`,
  1 AS `fecha`,
  1 AS `jugador`,
  1 AS `categoria`,
  1 AS `distancia`,
  1 AS `jugadorid`,
  1 AS `torneoid`,
  1 AS `descripcion` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_puttunico`
--

DROP TABLE IF EXISTS `v_puttunico`;
/*!50001 DROP VIEW IF EXISTS `v_puttunico`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_puttunico` AS SELECT
 1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `mindistancia` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_registro`
--

DROP TABLE IF EXISTS `v_registro`;
/*!50001 DROP VIEW IF EXISTS `v_registro`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_registro` AS SELECT
 1 AS `reg_id`,
  1 AS `reg_id_torneo`,
  1 AS `reg_id_club`,
  1 AS `reg_nombre`,
  1 AS `reg_apellido`,
  1 AS `reg_genero`,
  1 AS `reg_correo`,
  1 AS `reg_celular`,
  1 AS `reg_pais`,
  1 AS `reg_estado`,
  1 AS `reg_ciudad`,
  1 AS `reg_direccion`,
  1 AS `reg_cp`,
  1 AS `reg_spei`,
  1 AS `reg_handicap`,
  1 AS `reg_categoria`,
  1 AS `reg_club`,
  1 AS `reg_mensaje`,
  1 AS `status_pago`,
  1 AS `reg_cargo`,
  1 AS `reg_archivo_nombre`,
  1 AS `fecharegistro`,
  1 AS `verificado`,
  1 AS `akron_edad`,
  1 AS `akron_talla`,
  1 AS `akron_talla_guante`,
  1 AS `akron_monto_pago`,
  1 AS `akron_calzado`,
  1 AS `categoria`,
  1 AS `val_categoria`,
  1 AS `val_genero`,
  1 AS `val_club`,
  1 AS `regidmd5` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_registro_repetidos`
--

DROP TABLE IF EXISTS `v_registro_repetidos`;
/*!50001 DROP VIEW IF EXISTS `v_registro_repetidos`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_registro_repetidos` AS SELECT
 1 AS `reg_id_torneo`,
  1 AS `reg_nombre`,
  1 AS `reg_apellido`,
  1 AS `reg_correo`,
  1 AS `tot`,
  1 AS `id` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_resultar`
--

DROP TABLE IF EXISTS `v_resultar`;
/*!50001 DROP VIEW IF EXISTS `v_resultar`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_resultar` AS SELECT
 1 AS `jugadorid`,
  1 AS `SO`,
  1 AS `SA`,
  1 AS `estado`,
  1 AS `fecha_juego`,
  1 AS `salidagrupoid`,
  1 AS `categoriaid`,
  1 AS `torneoid`,
  1 AS `fechasal`,
  1 AS `teesal`,
  1 AS `gana`,
  1 AS `dif`,
  1 AS `totstbgross` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_sal_jug`
--

DROP TABLE IF EXISTS `v_sal_jug`;
/*!50001 DROP VIEW IF EXISTS `v_sal_jug`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_sal_jug` AS SELECT
 1 AS `tarjetaid`,
  1 AS `salidatorneoid`,
  1 AS `campoid`,
  1 AS `jugadorid`,
  1 AS `tee_salida`,
  1 AS `salidagrupoid`,
  1 AS `slope`,
  1 AS `rating`,
  1 AS `horainicio1a`,
  1 AS `horainicio2a`,
  1 AS `teesal`,
  1 AS `numjugador`,
  1 AS `nombre`,
  1 AS `apellido`,
  1 AS `fechahandicap`,
  1 AS `sexo`,
  1 AS `hcpindex`,
  1 AS `teesalidaid`,
  1 AS `correo`,
  1 AS `club`,
  1 AS `tipoinsc`,
  1 AS `tipoinsc2`,
  1 AS `indexjgo`,
  1 AS `colortee`,
  1 AS `tee`,
  1 AS `categoriaid`,
  1 AS `grupoid`,
  1 AS `torneoid`,
  1 AS `jugestatus`,
  1 AS `fecha_juego`,
  1 AS `caljuegoid`,
  1 AS `orden`,
  1 AS `abr`,
  1 AS `nummatch`,
  1 AS `acumsa`,
  1 AS `acumstbgross`,
  1 AS `acumso`,
  1 AS `hadicap`,
  1 AS `handicapneto`,
  1 AS `ventajasjug`,
  1 AS `arso`,
  1 AS `arsa`,
  1 AS `arsap`,
  1 AS `hdccamponeto`,
  1 AS `formato`,
  1 AS `porcetajejgo`,
  1 AS `logo`,
  1 AS `sistema`,
  1 AS `salidaid`,
  1 AS `gross`,
  1 AS `hcampo`,
  1 AS `ventajastar`,
  1 AS `tagid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_sal_jug_par`
--

DROP TABLE IF EXISTS `v_sal_jug_par`;
/*!50001 DROP VIEW IF EXISTS `v_sal_jug_par`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_sal_jug_par` AS SELECT
 1 AS `tarjetaid`,
  1 AS `salidatorneoid`,
  1 AS `id_campo`,
  1 AS `campoid`,
  1 AS `jugadorid`,
  1 AS `tee_salida`,
  1 AS `salidagrupoid`,
  1 AS `slope`,
  1 AS `rating`,
  1 AS `horainicio1a`,
  1 AS `horainicio2a`,
  1 AS `teesal`,
  1 AS `numjugador`,
  1 AS `nombre`,
  1 AS `fechahandicap`,
  1 AS `sexo`,
  1 AS `hcpindex`,
  1 AS `teesalidaid`,
  1 AS `correo`,
  1 AS `club`,
  1 AS `club2`,
  1 AS `tipoinsc`,
  1 AS `tipoinsc2`,
  1 AS `indexjgo`,
  1 AS `colortee`,
  1 AS `tee`,
  1 AS `categoriaid`,
  1 AS `grupoid`,
  1 AS `torneoid`,
  1 AS `jugestatus`,
  1 AS `fecha_juego`,
  1 AS `caljuegoid`,
  1 AS `orden`,
  1 AS `abr`,
  1 AS `indexjgoprom`,
  1 AS `abr2`,
  1 AS `jugid2`,
  1 AS `jugid1`,
  1 AS `nummatch`,
  1 AS `logo`,
  1 AS `logo2`,
  1 AS `acumsa`,
  1 AS `sistema`,
  1 AS `arso`,
  1 AS `arsa`,
  1 AS `arsap`,
  1 AS `sa`,
  1 AS `so` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_salidas_h1`
--

DROP TABLE IF EXISTS `v_salidas_h1`;
/*!50001 DROP VIEW IF EXISTS `v_salidas_h1`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_salidas_h1` AS SELECT
 1 AS `id`,
  1 AS `salidatorneoid`,
  1 AS `horainicio1a`,
  1 AS `horafin1a`,
  1 AS `horainicio2a`,
  1 AS `horafin2a`,
  1 AS `categoriaid`,
  1 AS `teesal`,
  1 AS `caljuegoid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_salidas_h10`
--

DROP TABLE IF EXISTS `v_salidas_h10`;
/*!50001 DROP VIEW IF EXISTS `v_salidas_h10`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_salidas_h10` AS SELECT
 1 AS `id`,
  1 AS `salidatorneoid`,
  1 AS `horainicio1a`,
  1 AS `horafin1a`,
  1 AS `horainicio2a`,
  1 AS `horafin2a`,
  1 AS `categoriaid`,
  1 AS `teesal`,
  1 AS `caljuegoid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_salidas_ls`
--

DROP TABLE IF EXISTS `v_salidas_ls`;
/*!50001 DROP VIEW IF EXISTS `v_salidas_ls`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_salidas_ls` AS SELECT
 1 AS `torneoid`,
  1 AS `fecha`,
  1 AS `campo`,
  1 AS `campoid`,
  1 AS `pwd`,
  1 AS `sistema` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_salidas_tarj`
--

DROP TABLE IF EXISTS `v_salidas_tarj`;
/*!50001 DROP VIEW IF EXISTS `v_salidas_tarj`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_salidas_tarj` AS SELECT
 1 AS `id`,
  1 AS `salidagrupoid`,
  1 AS `horainicio1a`,
  1 AS `teesal`,
  1 AS `numjug`,
  1 AS `categoria`,
  1 AS `fecha`,
  1 AS `campo`,
  1 AS `agrupo`,
  1 AS `numjugador`,
  1 AS `nombre`,
  1 AS `apellido`,
  1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `orden`,
  1 AS `club`,
  1 AS `clubid`,
  1 AS `categojug`,
  1 AS `so`,
  1 AS `sa`,
  1 AS `categoriaid`,
  1 AS `formato`,
  1 AS `caljuegoid`,
  1 AS `estilojuego`,
  1 AS `porcetajejgo`,
  1 AS `sistema`,
  1 AS `estatus`,
  1 AS `jugador`,
  1 AS `avance` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_salidas_tarj1`
--

DROP TABLE IF EXISTS `v_salidas_tarj1`;
/*!50001 DROP VIEW IF EXISTS `v_salidas_tarj1`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_salidas_tarj1` AS SELECT
 1 AS `id`,
  1 AS `salidagrupoid`,
  1 AS `horainicio1a`,
  1 AS `teesal`,
  1 AS `numjug`,
  1 AS `categoria`,
  1 AS `fecha`,
  1 AS `campo`,
  1 AS `agrupo`,
  1 AS `numjugador`,
  1 AS `nombre`,
  1 AS `apellido`,
  1 AS `jugador`,
  1 AS `torneoid`,
  1 AS `orden`,
  1 AS `club`,
  1 AS `clubid`,
  1 AS `categojug`,
  1 AS `so`,
  1 AS `sa`,
  1 AS `jugadorid`,
  1 AS `formato`,
  1 AS `caljuegoid`,
  1 AS `categoriaid`,
  1 AS `tagid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_salidas_tl`
--

DROP TABLE IF EXISTS `v_salidas_tl`;
/*!50001 DROP VIEW IF EXISTS `v_salidas_tl`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_salidas_tl` AS SELECT
 1 AS `torneoid`,
  1 AS `fecha`,
  1 AS `caljuegoid`,
  1 AS `categoria` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_salidas_x`
--

DROP TABLE IF EXISTS `v_salidas_x`;
/*!50001 DROP VIEW IF EXISTS `v_salidas_x`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_salidas_x` AS SELECT
 1 AS `id`,
  1 AS `fecha`,
  1 AS `categoria`,
  1 AS `categoria_id`,
  1 AS `torneoid`,
  1 AS `estatus`,
  1 AS `sistema`,
  1 AS `formato`,
  1 AS `estilo`,
  1 AS `ordenSal` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_skin_mingross`
--

DROP TABLE IF EXISTS `v_skin_mingross`;
/*!50001 DROP VIEW IF EXISTS `v_skin_mingross`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_skin_mingross` AS SELECT
 1 AS `Skin_grupo_id`,
  1 AS `campoid`,
  1 AS `torneoid`,
  1 AS `fecha_juego`,
  1 AS `h1`,
  1 AS `h2`,
  1 AS `h3`,
  1 AS `h4`,
  1 AS `h5`,
  1 AS `h6`,
  1 AS `h7`,
  1 AS `h8`,
  1 AS `h9`,
  1 AS `h10`,
  1 AS `h11`,
  1 AS `h12`,
  1 AS `h13`,
  1 AS `h14`,
  1 AS `h15`,
  1 AS `h16`,
  1 AS `h17`,
  1 AS `h18` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_skin_minneto`
--

DROP TABLE IF EXISTS `v_skin_minneto`;
/*!50001 DROP VIEW IF EXISTS `v_skin_minneto`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_skin_minneto` AS SELECT
 1 AS `Skin_grupo_id`,
  1 AS `campoid`,
  1 AS `torneoid`,
  1 AS `fecha_juego`,
  1 AS `h1`,
  1 AS `h2`,
  1 AS `h3`,
  1 AS `h4`,
  1 AS `h5`,
  1 AS `h6`,
  1 AS `h7`,
  1 AS `h8`,
  1 AS `h9`,
  1 AS `h10`,
  1 AS `h11`,
  1 AS `h12`,
  1 AS `h13`,
  1 AS `h14`,
  1 AS `h15`,
  1 AS `h16`,
  1 AS `h17`,
  1 AS `h18` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_subgrupos`
--

DROP TABLE IF EXISTS `v_subgrupos`;
/*!50001 DROP VIEW IF EXISTS `v_subgrupos`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_subgrupos` AS SELECT
 1 AS `categoriaid`,
  1 AS `jug` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_sum_golforo`
--

DROP TABLE IF EXISTS `v_sum_golforo`;
/*!50001 DROP VIEW IF EXISTS `v_sum_golforo`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_sum_golforo` AS SELECT
 1 AS `jugadorid`,
  1 AS `torneoid`,
  1 AS `go`,
  1 AS `sa`,
  1 AS `mgo` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_sumaptosrr`
--

DROP TABLE IF EXISTS `v_sumaptosrr`;
/*!50001 DROP VIEW IF EXISTS `v_sumaptosrr`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_sumaptosrr` AS SELECT
 1 AS `jugadorid`,
  1 AS `ptos`,
  1 AS `juegos`,
  1 AS `hog` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_sumrr`
--

DROP TABLE IF EXISTS `v_sumrr`;
/*!50001 DROP VIEW IF EXISTS `v_sumrr`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_sumrr` AS SELECT
 1 AS `jugadorid`,
  1 AS `categoriaid`,
  1 AS `totptos`,
  1 AS `diferencial` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_sumsa`
--

DROP TABLE IF EXISTS `v_sumsa`;
/*!50001 DROP VIEW IF EXISTS `v_sumsa`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_sumsa` AS SELECT
 1 AS `jugadorid`,
  1 AS `categoriaid`,
  1 AS `sumsa` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_sumsa_normal`
--

DROP TABLE IF EXISTS `v_sumsa_normal`;
/*!50001 DROP VIEW IF EXISTS `v_sumsa_normal`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_sumsa_normal` AS SELECT
 1 AS `jugadorid`,
  1 AS `categoriaid`,
  1 AS `sa`,
  1 AS `so`,
  1 AS `totstbgross` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_sumsarr`
--

DROP TABLE IF EXISTS `v_sumsarr`;
/*!50001 DROP VIEW IF EXISTS `v_sumsarr`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_sumsarr` AS SELECT
 1 AS `jugadorid`,
  1 AS `categoriaid`,
  1 AS `sumsa`,
  1 AS `avance` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_sumsarr2`
--

DROP TABLE IF EXISTS `v_sumsarr2`;
/*!50001 DROP VIEW IF EXISTS `v_sumsarr2`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_sumsarr2` AS SELECT
 1 AS `jugadorid`,
  1 AS `categoriaid`,
  1 AS `sumsa`,
  1 AS `avance` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_sumstbl_gross`
--

DROP TABLE IF EXISTS `v_sumstbl_gross`;
/*!50001 DROP VIEW IF EXISTS `v_sumstbl_gross`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_sumstbl_gross` AS SELECT
 1 AS `jugadorid`,
  1 AS `categoriaid`,
  1 AS `totstbgross` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_sumtarjeta`
--

DROP TABLE IF EXISTS `v_sumtarjeta`;
/*!50001 DROP VIEW IF EXISTS `v_sumtarjeta`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_sumtarjeta` AS SELECT
 1 AS `jugadorid`,
  1 AS `so`,
  1 AS `sa`,
  1 AS `totstbgross`,
  1 AS `hinicio`,
  1 AS `salidaid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_ult_tarjeta`
--

DROP TABLE IF EXISTS `v_ult_tarjeta`;
/*!50001 DROP VIEW IF EXISTS `v_ult_tarjeta`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_ult_tarjeta` AS SELECT
 1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `tarjetaid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_ult_tarjeta0`
--

DROP TABLE IF EXISTS `v_ult_tarjeta0`;
/*!50001 DROP VIEW IF EXISTS `v_ult_tarjeta0`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_ult_tarjeta0` AS SELECT
 1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `tarjetaid`,
  1 AS `ronda` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_ult_tarjeta_sin0`
--

DROP TABLE IF EXISTS `v_ult_tarjeta_sin0`;
/*!50001 DROP VIEW IF EXISTS `v_ult_tarjeta_sin0`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_ult_tarjeta_sin0` AS SELECT
 1 AS `torneoid`,
  1 AS `jugadorid`,
  1 AS `tarjetaid` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_v_oyesxjug`
--

DROP TABLE IF EXISTS `v_v_oyesxjug`;
/*!50001 DROP VIEW IF EXISTS `v_v_oyesxjug`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_v_oyesxjug` AS SELECT
 1 AS `id`,
  1 AS `campo`,
  1 AS `hoyo`,
  1 AS `premio`,
  1 AS `fecha`,
  1 AS `jugador`,
  1 AS `categoria`,
  1 AS `distancia`,
  1 AS `jugadorid`,
  1 AS `torneoid`,
  1 AS `descripcion` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `valorstable`
--

DROP TABLE IF EXISTS `valorstable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `valorstable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `torneoid` int(11) NOT NULL,
  `difpar` int(11) NOT NULL DEFAULT 0,
  `valor` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `torneoid` (`torneoid`)
) ENGINE=MyISAM AUTO_INCREMENT=1970 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'torneos'
--

--
-- Dumping routines for database 'torneos'
--
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_avancestable` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_avancestable`(jugidp int) RETURNS int(11)
BEGIN
declare resp int;

set resp=0;
select avance into resp from v_sumsarr where jugadorid=jugidp;


RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_catid_jug` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_catid_jug`(jugp int) RETURNS int(11)
BEGIN
declare catid int;
select categoriaid into catid from jugadores where id=jupp;
RETURN catid;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_correo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_correo`() RETURNS char(50) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare correo char(50);
declare idv int;
SET SQL_SAFE_UPDATES = 0;
set idv=0;
set correo='registro.torneo@speitour.mx';
update cuentas_correo set numcorreos=0 where left(fecha,10)< left(curdate(),10);

select cuenta_correo ,id into correo,idv from cuentas_correo where numcorreos<250 limit 1;
update cuentas_correo set numcorreos=numcorreos+1 where id=idv;

RETURN correo;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_extract_array` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_extract_array`(arrayx char(245),pos int) RETURNS int(20)
BEGIN
declare resp int;
declare respc char(3);
declare tmp char(245);
declare x int;
set x=0;

while x < pos do

set respc= replace( arrayx,SUBSTRING(arrayx, LOCATE(',',arrayx)),'' )  ;
set arrayx= SUBSTRING(arrayx, LOCATE(',',arrayx)+1);
set x=x+1;
end while;

set resp= cast(respc as unSIGNED);
if (respc='-1') then begin set resp=-1; end; end if;
if (respc='-2') then begin set resp=-2; end; end if;
if (respc='0') then begin set resp=0; end; end if;
if (respc='1') then begin set resp=1; end; end if;
if (respc='2') then begin set resp=2; end; end if;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_getjugposelim` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_getjugposelim`(catid int, posid int, diap int) RETURNS int(11)
BEGIN
declare resp int;
SELECT id into resp FROM torneos.jugadores where categoriaid=catid and grupoid=posid  limit 1;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_getjugxsal` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_getjugxsal`(salidp int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;
select count(*) into resp from tarjetas where salidagrupoid =salidp;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_getparhoyo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`itinnova`@`%` FUNCTION `f_getparhoyo`(salidaidp int, campoidp int, hoyop int) RETURNS int(11)
BEGIN
declare resp int;

SELECT par into resp FROM torneos.hoyosxsalida where campoid=campoidp and  numero=hoyop and salidaid=salidaidp;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_getsa` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`itinnova`@`%` FUNCTION `f_getsa`(tarid int,hoid int,valor int) RETURNS int(11)
BEGIN
declare resp int;
declare sistemav char(15);
declare vtjas char(50);
declare parcpoh char (50);
SET resp=0;
select c.sistema,ventajas,parcampohoyo into  sistemav,vtjas,parcpoh from tarjetas as a join categorias as c on (a.categoriaid=c.categoria_id) where  id= tarid;
if sistemav='STROKE PLAY' THEN BEGIN
	select (valor-TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(vtjas, ',', hoid), ',', -1))) into resp;
END; END IF;
if sistemav='STABLEFORD' THEN BEGIN
	select (TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(parcpoh, ',', hoid), ',', -1))- (valor-TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(vtjas, ',', hoid), ',', -1))) +2 ) INTO  resp;
    if resp <0 then begin
		set resp=0;
    end; end if;
END; END IF;



RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_getsalid` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_getsalid`(catidp int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

select salida into resp FROM categorias where categoria_id=catidp;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_getsalids` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_getsalids`(catidp int) RETURNS int(11)
BEGIN
declare resp char(45);
set resp='';

select tee into resp FROM categorias as a join salidas as b on (a.salida=b.id) where categoria_id=catidp;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_getvalorstbl` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`itinnova`@`%` FUNCTION `f_getvalorstbl`(torneoidp int,valorp int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

SELECT valor into resp FROM valorstable where torneoid=torneoidp and difpar<= valorp order by  difpar desc limit 1;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `F_GETVENTAJAJUG` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `F_GETVENTAJAJUG`(hcampop int,campoidx int ,salidaidx int) RETURNS char(45) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare vtjxh char(45);
declare vtj int;
declare vtjz int;
declare vtjadic int;
set vtjxh='0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
set vtjadic=0;
if hcampop > 0 then begin


		if hcampop >17 then begin
			set vtjadic=1;
			set hcampop=hcampop-18;
		end; end if;
		if hcampop >17 then begin
			set vtjadic=2;
			set hcampop=hcampop-18;
		end; end if;

		set vtjxh='';
		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=1 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
				set vtj=0+vtjadic;
				set vtjxh = concat(vtjxh,vtj,',');
			end;
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=2 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else begin
				set vtj=0+vtjadic;
				set vtjxh = concat(vtjxh,vtj,',');
			end;

		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=3 limit 1;
		if vtjz <= hcampop then 
		begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else 
			begin
				set vtj=0+vtjadic;
				set vtjxh = concat(vtjxh,vtj,',');
			end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=4 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
				set vtj=0+vtjadic;
				set vtjxh = concat(vtjxh,vtj,',');
			end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=5 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
				set vtj=0+vtjadic;
				set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=6 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
			set vtj=0+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
			end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=7 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
		begin
			set vtj=0+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=8 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
			set vtj=0+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=9 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
			begin
			set vtj=0+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=10 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
			set vtj=0+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;  
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=11 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
		begin
			set vtj=0+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=12 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
		   set vtj=0+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=13 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
			 begin
			set vtj=0+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=14 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		 begin
			set vtj=0+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;  
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=15 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
		 begin
			set vtj=0+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=16 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
			set vtj=0+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=17 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
		begin
			set vtj=0+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=18 limit 1;
		if vtjz <= hcampop then begin
			set vtj=1+vtjadic;
			set vtjxh = concat(vtjxh,vtj);
		end; else
		begin
			set vtj=0+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;  
		end if;
        
end; end if;  #  fin de if if handciap>0

#*********************************************************************
#      ************************   handiap < 0  ************************
#***********************************************************************
if hcampop < 0 then begin
    set hcampop=hcampop*-1;
    set hcampop=18-hcampop;
    set vtjxh='';
	set vtj=0;
    set vtjadic=0;
    
	select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=1 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
				set vtj=0;
				set vtjxh = concat(vtjxh,vtj,',');
			end;
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=2 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else begin
				set vtj=0;
				set vtjxh = concat(vtjxh,vtj,',');
			end;

		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=3 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		else 
			begin
				set vtj=0;
				set vtjxh = concat(vtjxh,vtj,',');
			end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=4 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		else
			begin
				set vtj=0;
				set vtjxh = concat(vtjxh,vtj,',');
			end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=5 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		else
			begin
				set vtj=0;
				set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=6 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		else
			begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
			end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=7 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
		begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=8 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=9 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
			begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=10 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;  
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=11 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
		begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=12 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
		   set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=13 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
			 begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=14 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		 begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;  
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=15 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
		 begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=16 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=17 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
		begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=18 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;  
		end if;

end; end if; #  fin de if if handciap  <0


RETURN vtjxh;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_getventajajug_hoyo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`itinnova`@`%` FUNCTION `f_getventajajug_hoyo`(hcampop int,campoidx int ,salidaidx int, hoyo int) RETURNS int(11)
BEGIN
declare vtjxh char(45);
declare vtj int;
declare vtjz int;
declare vtjadic int;
set vtjxh='0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
set vtjadic=0;
set vtj=0;
if hcampop > 0 then begin


		if hcampop >17 then begin
			set vtjadic=1;
			set hcampop=hcampop-18;
		end; end if;
		if hcampop >17 then begin
			set vtjadic=2;
			set hcampop=hcampop-18;
		end; end if;

		set vtjxh='';
		set vtj=0;
		if(hoyo=1) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=1 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
					
				end; end if;
		end; end if;
		if(hoyo=2) then begin
				set vtj=0;
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=2 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
					
				end; 	end if;
		end; end if;
		if(hoyo=3) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=3 limit 1;
				if vtjz <= hcampop then 
				begin
					set vtj=1+vtjadic;
					
				end; end if;
		end; end if;
		if(hoyo=4) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=4 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
			   end; end if;
		end; end if;
		if(hoyo=5) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=5 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
				end; 	end if;

		end; end if;
		if(hoyo=6) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=6 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
				end; end if;

		end; end if;
		if(hoyo=7) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=7 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
					
				end; end if;
		end; end if;
		if(hoyo=8) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=8 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
					
				end; 	end if;

		end; end if;
		if(hoyo=9) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=9 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
					
				end; 	end if;
		end; end if;
		if(hoyo=10) then begin
				set vtj=0;
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=10 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
					
				end; end if;
		end; end if;
		if(hoyo=11) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=11 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
					
				end; end if;
		end; end if;
		if(hoyo=12) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=12 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
					
				end;		 end if;
		end; end if;
		if(hoyo=13) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=13 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
					
				end;  end if;
		end; end if;
		if(hoyo=14) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=14 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
					
				end;end if;

		end; end if;
		if(hoyo=15) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=15 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
					
				end; 		end if;
		end; end if;
		if(hoyo=16) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=16 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
					
				end;  end if;
		end; end if;
		if(hoyo=17) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=17 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
				end;end if;
		end; end if;
		if(hoyo=18) then begin
				select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=18 limit 1;
				if vtjz <= hcampop then begin
					set vtj=1+vtjadic;
				end; end if;
		end; end if; 
end; end if; 
#  fin de if if handciap>0
/*
#*********************************************************************
#      ************************   handiap < 0  ************************
#***********************************************************************
if hcampop < 0 then begin
    set hcampop=hcampop*-1;
    set hcampop=18-hcampop;
    set vtjxh='';
	set vtj=0;
    set vtjadic=0;
    
	select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=1 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; 
		else
			begin
				set vtj=0;
				
			end;
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=2 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; 
		else begin
				set vtj=0;
				
			end;

		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=3 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end;
		else 
			begin
				set vtj=0;
				
			end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=4 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end;
		else
			begin
				set vtj=0;
				
			end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=5 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end;
		else
			begin
				set vtj=0;
				
		end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=6 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end;
		else
			begin
			set vtj=0;
			
			end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=7 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; 
		else
		begin
			set vtj=0;
			
		end; 
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=8 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; 
		else
			begin
			set vtj=0;
			
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=9 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; else 
			begin
			set vtj=0;
			
		end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=10 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; else
		begin
			set vtj=0;
			
		end;  
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=11 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; else 
		begin
			set vtj=0;
			
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=12 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; else
		begin
		   set vtj=0;
			
		end; 
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=13 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; else
			 begin
			set vtj=0;
			
		end; 
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=14 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; else
		 begin
			set vtj=0;
			
		end;  
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=15 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; else 
		 begin
			set vtj=0;
			
		end; 
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=16 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; else
		begin
			set vtj=0;
			
		end;
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=17 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; else 
		begin
			set vtj=0;
			
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=18 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			
		end; else
		begin
			set vtj=0;
			
		end;  
		end if;

end; end if; #  fin de if if handciap  <0
*/

RETURN vtj;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_getVtajaHoyo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_getVtajaHoyo`(`f_string` VARCHAR(1000), `f_delimiter` VARCHAR(5), `f_order` INT) RETURNS char(5) CHARSET latin1 COLLATE latin1_swedish_ci
    READS SQL DATA
    DETERMINISTIC
BEGIN
 -- Get the separated number of given string.
 declare result varchar(5) default '';
 declare res char(5);
set result ='0';
 set result = reverse(substring_index(reverse(substring_index(f_string,',',f_order)),',',1));

 
 return result ;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_getVtjaJugOro` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_getVtjaJugOro`(`hcampop` DECIMAL(5,1), `campoidx` INT, `salidaidx` INT) RETURNS char(145) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare vtjxh char(145);
declare vtj decimal(5,1);
declare vtjz int;
declare vtjadic int;
declare sumvta decimal(5,1);
declare res decimal(5,1);
set vtjxh='0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
set vtjadic=0;
if hcampop > 0 then begin

		if hcampop >17 then begin
			set vtjadic=1;
			set hcampop=hcampop-18;
		end; end if;
		if hcampop >17 then begin
			set vtjadic=2;
			set hcampop=hcampop-18;
		end; end if;

		set vtjxh='';
		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=1 limit 1;
		if vtjz <= hcampop then begin
            set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
               set res= round(hcampop-vtjz,1); 
                select if( res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
				set vtjxh = concat(vtjxh,vtj,',');
			end;
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=2 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else begin
				set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
				set vtjxh = concat(vtjxh,vtj,',');
			end;

		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=3 limit 1;
		if vtjz <= hcampop then 
		begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else 
			begin
				set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
				set vtjxh = concat(vtjxh,vtj,',');
			end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=4 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
				set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
				set vtjxh = concat(vtjxh,vtj,',');
			end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=5 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
				set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
				set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=6 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
			set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
			end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=7 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
		begin
			set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=8 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
			set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=9 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
			begin
			set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=10 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
			set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;  
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=11 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
		begin
			set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=12 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
		   set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=13 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
			 begin
			set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=14 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		 begin
			set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;  
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=15 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
		 begin
			set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=16 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
			set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=17 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
		begin
			set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=18 limit 1;
		if vtjz <= hcampop then begin
			set sumvta=1;
			set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj);
		end; else
		begin
			set res= round(hcampop-vtjz,1); 
                select if(res<0 and res > -1,round(res+1,1),0) into sumvta;
				set vtj=sumvta+vtjadic;
			set vtjxh = concat(vtjxh,vtj,',');
		end;  
		end if;
        
end; end if;  #  fin de if if handciap>0

#*********************************************************************
#      ************************   handiap < 0  ************************
#***********************************************************************
if hcampop < 0 then begin
    set hcampop=hcampop*-1;
    set hcampop=18-hcampop;
    set vtjxh='';
	set vtj=0;
    set vtjadic=0;
    
	select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=1 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
				set vtj=0;
				set vtjxh = concat(vtjxh,vtj,',');
			end;
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=2 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else begin
				set vtj=0;
				set vtjxh = concat(vtjxh,vtj,',');
			end;

		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=3 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		else 
			begin
				set vtj=0;
				set vtjxh = concat(vtjxh,vtj,',');
			end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=4 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		else
			begin
				set vtj=0;
				set vtjxh = concat(vtjxh,vtj,',');
			end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=5 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		else
			begin
				set vtj=0;
				set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=6 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		else
			begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
			end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=7 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
		begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=8 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		else
			begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=9 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
			begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;
		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=10 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;  
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=11 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
		begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=12 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
		   set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=13 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
			 begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=14 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		 begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;  
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=15 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
		 begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end; 
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=16 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		 end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=17 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else 
		begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;
		end if;

		set vtj=0;

		select ventaja into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=18 limit 1;
		if vtjz > hcampop then begin
			set vtj=-1;
			set vtjxh = concat(vtjxh,vtj,',');
		end; else
		begin
			set vtj=0;
			set vtjxh = concat(vtjxh,vtj,',');
		end;  
		end if;

end; end if; #  fin de if if handciap  <0


RETURN vtjxh;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_getyardas` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_getyardas`(campoidx int ,salidaidx int) RETURNS char(45) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare vtjxh char(45);
declare vtj int;
declare vtjz int;
declare vtjadic int;
set vtjxh='0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
set vtjadic=0;

		set vtjxh='';
		set vtj=0;

select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=1 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=2 limit 1;
		set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=3 limit 1;
		set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=4 limit 1;
		set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=5 limit 1;
		set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=6 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=7 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=8 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=9 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=10 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=11 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=12 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=13 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=14 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=15 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=16 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=17 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');
select yardaje into vtjz  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=18 limit 1;
	set vtjxh = concat(vtjxh,vtj,',');

RETURN vtjxh;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_handicap_gogo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_handicap_gogo`(torneoidp int, numjugadorp char(15), caljgoidp int) RETURNS int(11)
BEGIN
declare resp int;
declare a int;
declare b int;
declare c int;
declare d int;

SELECT a.torneoid,numjugador,a.categoriaid,b.id
#,round((f_hdccampo(hcpindex,teesalidaid,b.campo)*b.porcetajejgo/100),0) as hcampo
#,    round((f_hdccampo(hcpindex,teesalidaid,b.campo)*b.porcetajejgo/100),1) as hcampo
,round(sum(round((f_hdccampo(hcpindex,teesalidaid,b.campo)*b.porcetajejgo/100),1))/count(*),0) as hcampo into a,b,c,d, resp
 FROM torneos.jugadores as a join caljuego as b on (a.torneoid=b.torneoid and a.categoriaid=b.categoriaid )
 where a.id=torneoidp and b.id=caljgoidp and numjugador=numjugadorp
 group by a.torneoid,numjugador,a.categoriaid,b.id;
 
 
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `F_HDCCAMPO` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `F_HDCCAMPO`(indexjgo  decimal(5,1), salidaidp int ,campoidp int) RETURNS int(11)
BEGIN
declare handicap int;
declare rating  double;
declare slope int;
declare parcampo int;

SELECT a.slope,a.rating,a.parcampo into slope,rating,parcampo  FROM `campo_tee`as a join salidas as b on (a.salidaid=b.id) where a.salidaid=salidaidp and a.campoid=campoidp;
#id, salidaid, campoid, slope, rating, max_hcp, activa, parcampo, orden, ventajas, parcampohoyo, tee
set handicap = round(indexjgo*(slope/113),2);
set handicap = round((indexjgo*(slope/113))+rating-parcampo+(if(rating-parcampo=0.5,0.05,0)),0);
RETURN handicap;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `F_HDCCAMPONETO` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `F_HDCCAMPONETO`(indexjgo  decimal(5,1), salidaidp int ,campoidp int,porcentaje int) RETURNS int(11)
BEGIN
declare handicap int;
declare rating  double;
declare slope int;
declare parcampo int;

#SELECT a.slope,a.rating,a.parcampo into slope,rating,parcampo  FROM `campo_tee`as a join salidas as b on (a.salidaid=b.id) where a.salidaid=salidaidp and a.campoid=campoidp;
#id, salidaid, campoid, slope, rating, max_hcp, activa, parcampo, orden, ventajas, parcampohoyo, tee
set handicap = round(f_hdccampo(indexjgo , salidaidp ,campoidp ) *porcentaje/100,0);
RETURN handicap;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_impresul` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_impresul`(catid int) RETURNS int(11)
BEGIN
declare resp int;
SELECT count(*) into resp FROM caljuego where categoriaid=catid and campo>0 and estatus <3;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_indexgolforo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_indexgolforo`(jugid int,fecha date) RETURNS double
BEGIN
declare resp double;
set resp=0;

SELECT go into resp FROM `tarjetas` where left(fecha_juego,10)=fecha  and jugadorid=jugid;


RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_indexparejas` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_indexparejas`(paridp int) RETURNS double
BEGIN
declare hindex double;

SELECT indexjgo into hindex FROM torneos.v_jugadores_parejas where jugadorid=paridp;


RETURN hindex;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_jugcategoria` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_jugcategoria`(catidp int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;
select count(*) into resp FROM registro WHERE reg_categoria=catidp;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_jugcategoriareg` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_jugcategoriareg`(catidp int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;
select count(*) into resp FROM registro where status_pago<>99 and reg_categoria=catidp;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_jugidplgrupo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_jugidplgrupo`(grupo char(1),catidx int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

#SELECT so into resp FROM `v_resultar` where left(fecha_juego,10)=fecha  and jugadorid=jugid;
SELECT id into resp FROM torneos.jugadores where categoriaid=catidx and estatus='FIRST' and left(grupoid,1)=grupo;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_jugidslgrupo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_jugidslgrupo`(grupo char(1),catidx int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

#SELECT so into resp FROM `v_resultar` where left(fecha_juego,10)=fecha  and jugadorid=jugid;
SELECT id into resp FROM jugadores where categoriaid=catidx and estatus='SECOND' and left(grupoid,1)=grupo;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_logo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_logo`(club char(100)) RETURNS char(100) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare resp char(100);

SELECT  concat('logos/',logo) into resp FROM clubs where trim(nombre) like concat(club,'%') limit 1;
if resp is  null then begin
	set resp="";
end; end if;
RETURN resp;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_logo_jug` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_logo_jug`(jugidp int) RETURNS char(100) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare resp char(100);
select b.logo into resp FROM jugadores as a join clubs as b on (a.clubid=b.id) where a.id=jugidp;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_maxsalgpoid` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_maxsalgpoid`(caljgoidp int) RETURNS int(11)
BEGIN
declare resp int;

SELECT max(id) into resp FROM salidagrupo where caljuegoid=caljgoidp;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_mejorjug` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_mejorjug`(fechajgo date, catidp int, formajuego char(45) ) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;
if (formajuego='STABLEFORD') then begin

SELECT a.id into resp #concat(nombre, apellido) as jug,b.sa,(h10_a+h11_a+h12_a+h13_a+h14_a+h15_a+h16_a+h17_a+h18_a) d1018,(h13_a+h14_a+h15_a+h16_a+h17_a+h18_a) d1318 ,(h16_a+h17_a+h18_a) d1618 ,h18_a
 FROM torneos.jugadores as a join tarjetas as b on (a.id=b.jugadorid and b.fecha_juego=fechajgo)
 where a.categoriaid=catidp and b.jugadorid not in (select ms_jugid from caljuego where fecha <fechajgo)
order by b.sa desc ,(h10_a+h11_a+h12_a+h13_a+h14_a+h15_a+h16_a+h17_a+h18_a) desc ,(h13_a+h14_a+h15_a+h16_a+h17_a+h18_a) desc ,(h16_a+h17_a+h18_a) desc ,h18_a desc 
limit 1;
end; end if;

if (formajuego='STROKE PLAY') then begin

SELECT a.id into resp #concat(nombre, apellido) as jug,b.sa,(h10_a+h11_a+h12_a+h13_a+h14_a+h15_a+h16_a+h17_a+h18_a) d1018,(h13_a+h14_a+h15_a+h16_a+h17_a+h18_a) d1318 ,(h16_a+h17_a+h18_a) d1618 ,h18_a
 FROM torneos.jugadores as a join tarjetas as b on (a.id=b.jugadorid and b.fecha_juego=fechajgo)
 where a.categoriaid=catidp and b.jugadorid not in (select ms_jugid from caljuego where fecha <fechajgo)
order by b.sa  ,(h10_a+h11_a+h12_a+h13_a+h14_a+h15_a+h16_a+h17_a+h18_a)  ,(h13_a+h14_a+h15_a+h16_a+h17_a+h18_a)  ,(h16_a+h17_a+h18_a)  ,h18_a  
limit 1;
end; end if;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_mingross` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_mingross`(hoyo int, fechap date, grupoidp int, torneoidp int) RETURNS int(11)
BEGIN
declare resp int;
if hoyo= 1 then begin select min(h1) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 2 then begin select min(h2) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 3 then begin select min(h3) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 4 then begin select min(h4) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 5 then begin select min(h5) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 6 then begin select min(h6) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 7 then begin select min(h7) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 8 then begin select min(h8) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 9 then begin select min(h9) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 10 then begin select min(h10) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 11 then begin select min(h11) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 12 then begin select min(h12) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 13 then begin select min(h13) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 14 then begin select min(h14) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 15 then begin select min(h15) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 16 then begin select min(h16) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 17 then begin select min(h17) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  
if hoyo= 18 then begin select min(h18) into  resp FROM `Skeen_tarjetas` as sa join categorias as sb on (sb.categoria_id=sa.categoriaid) where sa.torneoid=torneoidp and sb.Skin_grupo_id=grupoidp and sa.fecha_juego=fechap; end; end if;  

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_minsalgpoid` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_minsalgpoid`(caljgoidp int) RETURNS int(11)
BEGIN
declare resp int;

SELECT min(id) into resp FROM salidagrupo where caljuegoid=caljgoidp;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_numjugcat` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_numjugcat`(catid int) RETURNS int(11)
BEGIN
declare resp int;
declare xx int;

SELECT count(*) into xx FROM jugadores where  estatus='NORMAL' and categoriaid=catid GRoup by  categoriaid;

set resp=xx;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_parcampo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_parcampo`(campoidx int,salidaidx int) RETURNS char(45) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare parcampo char(45);
declare vpar char(1);
set parcampo='';

select par into vpar  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=1 limit 1;
set parcampo=concat(parcampo,vpar,',');

select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=2  limit 1;
set parcampo=concat(parcampo,vpar,',');
select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=3 limit 1;
set parcampo=concat(parcampo,vpar,',');
select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=4 limit 1 ;
set parcampo=concat(parcampo,vpar,',');
select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=5 limit 1;
set parcampo=concat(parcampo,vpar,',');
select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=6 limit 1 ;
set parcampo=concat(parcampo,vpar,',');

select par into vpar  FROM hoyosxsalida where  campoid=campoidx and salidaid=salidaidx and numero=7 limit 1 ;
set parcampo=concat(parcampo,vpar,',');

select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=8 limit 1 ;
set parcampo=concat(parcampo,vpar,',');
select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=9  limit 1;
set parcampo=concat(parcampo,vpar,',');

select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=10 limit 1;
set parcampo=concat(parcampo,vpar,',');
select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=11 limit 1;
set parcampo=concat(parcampo,vpar,',');
select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=12 limit 1;
set parcampo=concat(parcampo,vpar,',');
select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=13 limit 1;
set parcampo=concat(parcampo,vpar,',');
select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=14 limit 1;
set parcampo=concat(parcampo,vpar,',');
select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=15 limit 1;
set parcampo=concat(parcampo,vpar,',');
select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=16 limit 1;
set parcampo=concat(parcampo,vpar,',');
select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=17 limit 1;
set parcampo=concat(parcampo,vpar,',');
select par into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=18 limit 1;
set parcampo=concat(parcampo,vpar);


RETURN parcampo;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `F_PAREJA` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `F_PAREJA`(jugadoridp int) RETURNS char(100) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare resp char(50);
select pareja into resp from v_jugadores where jugadorid=jugadoridp;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_parj2id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_parj2id`(paridp int) RETURNS int(11)
BEGIN
declare id2 int;

SELECT jugadorid2 into id2 FROM torneos.v_jugadores_parejas where jugadorid=paridp;


RETURN id2;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_plmatch` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_plmatch`(nummachtX int, catid int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

#SELECT id into resp FROM torneos.jugadores where categoriaid=catidx and estatus='FIRST' and left(grupoid,1)=grupo;
SELECT jugadorid into resp FROM tarjetas where  nummatch=nummachtX and gana=1 and categoriaid=catid;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_posjug` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_posjug`(jugid int, ptos int, sistemap char(30) ,catid int) RETURNS int(11)
BEGIN
declare pos int;
declare grossv int default 0;

select gross into grossv from categorias where categoria_id=catid;



if sistemap ='STROKE PLAY' then begin
	if (grossv=0) then begin 
		SELECT count(*)+1 into pos FROM v_sumsa_normal where sa<ptos and categoriaid=catid;
    end; end if;
    if (grossv=1) then begin 
		SELECT count(*)+1 into pos FROM v_sumsa_normal where so<ptos and categoriaid=catid;
    end; end if;
end; end if;

if sistemap ='STABLEFORD' then begin
	if (grossv=0) then begin 
		SELECT count(*)+1 into pos FROM v_sumsa_normal where sa>ptos and categoriaid=catid;
	end; end if;
    if (grossv=1) then begin 
		SELECT count(*)+1 into pos FROM v_sumsa_normal where totstbgross>ptos and categoriaid=catid;
	end; end if;
end; end if;

RETURN pos;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_premio` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_premio`(ptorneoid int ,ppremio int) RETURNS char(45) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare resp char(45);

SELECT  distinct descripcion into resp FROM premios  where torneoid=ptorneoid and premio =ppremio limit 1;
if resp is  null then begin
	set resp="NO TIENE PREMIO";
end; end if;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_premiosoyes` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_premiosoyes`(torid int) RETURNS int(11)
BEGIN
declare resp int;
SELECT oyesnumprem into resp  FROM torneos.torneo where torneo_id=torid;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_pslmatch` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_pslmatch`(nummachtX int, catid int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

#SELECT id into resp FROM torneos.jugadores where categoriaid=catidx and estatus='FIRST' and left(grupoid,1)=grupo;
SELECT jugadorid into resp FROM tarjetas where  nummatch=nummachtX and gana=0 and categoriaid=catid;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_score_dia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_score_dia`(jugid int,fecha date) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

SELECT so into resp FROM `v_resultar` where left(fecha_juego,10)=fecha  and jugadorid=jugid;


RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_score_dia_sa` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_score_dia_sa`(jugid int,fecha date) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

SELECT sa into resp FROM `v_resultar` where left(fecha_juego,10)=fecha  and jugadorid=jugid;


RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_score_dia_satblU` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_score_dia_satblU`(jugid int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

SELECT totstbgross into resp FROM `v_resultar` where  jugadorid=jugid and sa>0 order by fecha_juego desc limit 1;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_score_dia_sax` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_score_dia_sax`(jugid int,fecha date) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

SELECT sa into resp FROM `v_resultar` where left(fecha_juego,10)=fecha  and jugadorid=jugid and sa>0;


RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_score_dia_saxU` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_score_dia_saxU`(jugid int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

SELECT sa into resp FROM `v_resultar` where  jugadorid=jugid and sa>0 order by fecha_juego desc limit 1;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_score_dia_sox` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_score_dia_sox`(jugid int,fecha date) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

SELECT so into resp FROM `v_resultar` where left(fecha_juego,10)=fecha  and jugadorid=jugid and sa>0;


RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_score_dia_soxU` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_score_dia_soxU`(jugid int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

SELECT so into resp FROM `v_resultar` where  jugadorid=jugid and sa>0 order by fecha_juego desc limit 1;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_score_stbl_gross` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_score_stbl_gross`(jugid int,fecha date) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

SELECT totstbgross into resp FROM `v_resultar` where left(fecha_juego,10)=fecha  and jugadorid=jugid and sa>0;


RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_sk_tottarGross` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_sk_tottarGross`(gpoid int,campoid int,torneoidp int ,hoyo int, fecha date, stroke int) RETURNS char(250) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare resp char(250);
set resp=0;

if hoyo=1 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h1=stroke;
  end; end if;
  
if hoyo=2 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h2=stroke;
  end; end if;
  
if hoyo=3 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h3=stroke;
  end; end if;
  
if hoyo=4 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h4=stroke;
  end; end if;
  
if hoyo=5 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h5=stroke;
  end; end if;
  
if hoyo=6 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h6=stroke;
  end; end if;
  
  if hoyo=7 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h7=stroke;
  end; end if;
  
  if hoyo=8 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h8=stroke;
  end; end if;
  
  if hoyo=9 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h9=stroke;
  end; end if;
  
  if hoyo=10 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h10=stroke;
  end; end if;
  
  if hoyo=11 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h11=stroke;
  end; end if;
  
  if hoyo=12 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h12=stroke;
  end; end if;
  
  if hoyo=13 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h13=stroke;
  end; end if;
  
  if hoyo=14 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h14=stroke;
  end; end if;
  
  if hoyo=15 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h15=stroke;
  end; end if;
  
  if hoyo=16 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h16=stroke;
  end; end if;
  
  if hoyo=17 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h17=stroke;
  end; end if;
  
  if hoyo=18 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h18=stroke;
  end; end if;

  
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_sk_tottarNeto` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_sk_tottarNeto`(gpoid int,campoid int,torneoidp int ,hoyo int, fecha date, stroke int) RETURNS char(250) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare resp char(250);
set resp=0;

if hoyo=1 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h1_a=stroke;
  end; end if;
  
if hoyo=2 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h2_a=stroke;
  end; end if;
  
if hoyo=3 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h3_a=stroke;
  end; end if;
  
if hoyo=4 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h4_a=stroke;
  end; end if;
  
if hoyo=5 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h5_a=stroke;
  end; end if;
  
if hoyo=6 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h6_a=stroke;
  end; end if;
  
  if hoyo=7 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h7_a=stroke;
  end; end if;
  
  if hoyo=8 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h8_a=stroke;
  end; end if;
  
  if hoyo=9 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h9_a=stroke;
  end; end if;
  
  if hoyo=10 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h10_a=stroke;
  end; end if;
  
  if hoyo=11 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h11_a=stroke;
  end; end if;
  
  if hoyo=12 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h12_a=stroke;
  end; end if;
  
  if hoyo=13 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h13_a=stroke;
  end; end if;
  
  if hoyo=14 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h14_a=stroke;
  end; end if;
  
  if hoyo=15 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h15_a=stroke;
  end; end if;
  
  if hoyo=16 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h16_a=stroke;
  end; end if;
  
  if hoyo=17 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h17_a=stroke;
  end; end if;
  
  if hoyo=18 then begin
	select count(*) into resp FROM `Skeen_tarjetas` as a join categorias as b on (b.categoria_id=a.categoriaid) 
	where b.Skin_grupo_id=gpoid and id_campo=campoid and torneoid=torneoidp 
	and fecha_juego=fecha and h18_a=stroke;
  end; end if;

  
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_stl_gross` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_stl_gross`(pjugid int ,ptorneoid int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

select  sum(totstbgross) into resp 
from tarjetas
where torneoid=ptorneoid and jugadorid=pjugid and sa>0
group by jugadorid,torneoid;

RETURN resp;

RETURN 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_subcatego` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_subcatego`(catid int) RETURNS varchar(100) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare resp varchar(100);
declare xx int;
set resp='{"jug": 0, "grupo": "A"}';
SELECT categoriaid,concat('[',GROUP_CONCAT(jug),']') into xx,resp from v_subgrupos where categoriaid in (catid)  group by categoriaid;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_sumsa` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_sumsa`(jugidp int) RETURNS int(11)
BEGIN
declare resp int;

set resp=0;
select sumsa into resp from v_sumsarr where jugadorid=jugidp;


RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_sumsa0` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_sumsa0`(jugidp int) RETURNS int(11)
BEGIN
declare resp int;

set resp=0;
select sumsa into resp from v_sumsa where jugadorid=jugidp;


RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_torneosa` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_torneosa`(pjugid int ,ptorneoid int) RETURNS int(11)
BEGIN


declare resp int;
set resp=0;

select  sum(sa) into resp 
from tarjetas
where torneoid=ptorneoid and jugadorid=pjugid
group by jugadorid,torneoid;

RETURN resp;

RETURN 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `F_TORNEOSAX` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `F_TORNEOSAX`(pjugid int ,ptorneoid int) RETURNS int(11)
BEGIN


declare resp int;
set resp=0;

select  sum(sa) into resp 
from tarjetas
where torneoid=ptorneoid and jugadorid=pjugid and sa>0
group by jugadorid,torneoid;

RETURN resp;


END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_torneoso` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_torneoso`(pjugid int ,ptorneoid int) RETURNS int(11)
BEGIN


declare resp int;
set resp=0;

select  sum(so) into resp 
from tarjetas
where torneoid=ptorneoid and jugadorid=pjugid
group by jugadorid,torneoid;

RETURN resp;

RETURN 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `F_TORNEOSOX` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `F_TORNEOSOX`(pjugid int ,ptorneoid int) RETURNS int(11)
BEGIN


declare resp int;
set resp=0;

select  sum(so) into resp 
from tarjetas
where torneoid=ptorneoid and jugadorid=pjugid and sa>0
group by jugadorid,torneoid;

RETURN resp;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `F_TORNEO_STBGROSS` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `F_TORNEO_STBGROSS`(pjugid int ,ptorneoid int) RETURNS int(11)
BEGIN
declare resp int;
set resp=0;

select  sum(totstbgross) into resp 
from tarjetas
where torneoid=ptorneoid and jugadorid=pjugid and sa>0
group by jugadorid,torneoid;

RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_ultact` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_ultact`(torneoidp int, premioidp int) RETURNS datetime
BEGIN
declare resp datetime;
select max(date_sub(a.ultact, INTERVAL 0 hour  )) into resp
from premiosjug as a join jugadores as b on (a.jugadorid=b.id and a.orden=1 ) 
join premios as c on (a.fecha=c.fecha and a.campo=c.campo and a.hoyo=c.hoyo and b.categoriaid=c.categoriaid) 
where a.torneoid=torneoidp and c.premio=premioidp;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_ultfechaapproach` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_ultfechaapproach`(descrip char(45),torneoidp int) RETURNS datetime
BEGIN
declare resp datetime;

select max(DATE_SUB(ultact, INTERVAL 0 hour)) into resp from approachjug where torneoid=torneoidp and premiosjugcol=descrip;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_ultfechadriver` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_ultfechadriver`(descrip char(45),torneoidp int) RETURNS datetime
BEGIN
declare resp datetime;

select max(DATE_SUB(ultact, INTERVAL 0 hour)) into resp from driverjug where torneoid=torneoidp and premiosjugcol=descrip;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_ultfechadriverp` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_ultfechadriverp`(descrip char(45),torneoidp int) RETURNS datetime
BEGIN
declare resp datetime;

select max(DATE_SUB(ultact, INTERVAL 0 hour)) into resp from driverjugp where torneoid=torneoidp and premiosjugcol=descrip;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_ultfechaoyesx` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_ultfechaoyesx`(descrip char(45),torneoidp int) RETURNS datetime
BEGIN
declare resp datetime;

select max(DATE_SUB(ultact, INTERVAL 0 hour)) into resp from oyesxjug where torneoid=torneoidp and premiosjugcol=descrip;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_ultfechaputt` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_ultfechaputt`(descrip char(45),torneoidp int) RETURNS datetime
BEGIN
declare resp datetime;

select max(DATE_SUB(ultact, INTERVAL 0 hour)) into resp from puttjug where torneoid=torneoidp and premiosjugcol=descrip;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_ventajacampo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `f_ventajacampo`(campoidx int,salidaidx int) RETURNS char(45) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare parcampo char(45);
declare vpar char(2);
set parcampo='';

select ventaja into vpar  FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=1 limit 1;
set parcampo=concat(parcampo,vpar,',');

select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=2  limit 1;
set parcampo=concat(parcampo,vpar,',');
select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=3 limit 1;
set parcampo=concat(parcampo,vpar,',');
select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=4 limit 1 ;
set parcampo=concat(parcampo,vpar,',');
select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=5 limit 1;
set parcampo=concat(parcampo,vpar,',');
select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=6 limit 1 ;
set parcampo=concat(parcampo,vpar,',');

select ventaja into vpar  FROM hoyosxsalida where  campoid=campoidx and salidaid=salidaidx and numero=7 limit 1 ;
set parcampo=concat(parcampo,vpar,',');

select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=8 limit 1 ;
set parcampo=concat(parcampo,vpar,',');
select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=9  limit 1;
set parcampo=concat(parcampo,vpar,',');

select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=10 limit 1;
set parcampo=concat(parcampo,vpar,',');
select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=11 limit 1;
set parcampo=concat(parcampo,vpar,',');
select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=12 limit 1;
set parcampo=concat(parcampo,vpar,',');
select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=13 limit 1;
set parcampo=concat(parcampo,vpar,',');
select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=14 limit 1;
set parcampo=concat(parcampo,vpar,',');
select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=15 limit 1;
set parcampo=concat(parcampo,vpar,',');
select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=16 limit 1;
set parcampo=concat(parcampo,vpar,',');
select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=17 limit 1;
set parcampo=concat(parcampo,vpar,',');
select ventaja into vpar   FROM hoyosxsalida where campoid=campoidx and salidaid=salidaidx and numero=18 limit 1;
set parcampo=concat(parcampo,vpar);


RETURN parcampo;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `F_VSWHO` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` FUNCTION `F_VSWHO`(catidp int,matchp int,gpoid char(5)) RETURNS char(3) CHARSET latin1 COLLATE latin1_swedish_ci
BEGIN
declare resp char(3);
SELECT concat(grupo,numjugador) into resp FROM rr_salidas_cat 
where catid=catidp and nummatch=matchp and concat(grupo,numjugador) <>gpoid;
RETURN resp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_acted` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` PROCEDURE `sp_acted`(catidp int,jugidp int)
BEGIN
declare tarid int;
declare tipojgo char(30);
set tarid=0;
set tipojgo='';

update  torneos.elimin_salidas_cat as a join jugadores as b on (a.posicionp=posicion and b.categoriaid=a.catid)
set jugida=b.id
where catid=catidp and b.id=jugidp;

update  torneos.elimin_salidas_cat as a join jugadores as b on (a.posicions=posicion and b.categoriaid=a.catid)
set jugidb=b.id
where catid=catidp and b.id=jugidp;



END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_actindex` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` PROCEDURE `sp_actindex`(catidp int,jugidp int)
BEGIN
declare tarid int;
declare tipojgo char(30);
set tarid=0;
set tipojgo='';

SELECT a.id,c.estilojuego into tarid,tipojgo FROM tarjetas  as a join salidagrupo as s on  (a.salidagrupoid=s.id) join caljuego as c on (s.caljuegoid=c.id)
where  a.jugadorid=jugidp and a.so=0;

if (tipojgo='Go Go') then begin
	update   tarjetas as a join jugadores as b on (a.jugadorid=b.id)  
	  join v_handicap_gogo as v on (b.torneoid=v.torneoid and b.categoriaid=v.categoriaid and b.numjugador=v.numjugador)
	  set a.hcampo=v.hcampo 
	  where a.id=tarid;
      
    update tarjetas as a join jugadores as b on (a.jugadorid=b.id) join categorias as c on (b.categoriaid=c.categoria_id)
	set parcampohoyo=f_parcampo(a.campoid, c.salida),ventajas= f_getventajajug(a.hcampo,a.campoid,c.salida) 
	 where a.id=tarid ;
end; end if;

if (tipojgo<>'Go Go') then begin
	update tarjetas as a join jugadores as b on (a.jugadorid=b.id) join categorias as c on (b.categoriaid=c.categoria_id)
	 set a.hcampo=f_hdccamponeto(b.indexjgo,c.salida,a.campoid,c.porcentaje) 
	 where a.id=tarid;
     
	 update tarjetas as a join jugadores as b on (a.jugadorid=b.id) join categorias as c on (b.categoriaid=c.categoria_id)
	 set parcampohoyo=f_parcampo(a.campoid, c.salida),ventajas= f_getventajajug(a.hcampo,a.campoid,c.salida) 
	 where a.id=tarid;
end; end if;

 update tarjetas as a join categorias as b on (a.categoriaid=b.categoria_id )
 join jugadores as j on (a.jugadorid=j.id   )
 set a.go= round(f_hdccampo(j.indexjgo,tee_salida,campoid),0)*b.golforo/100
 where a.id=tarid;


 update tarjetas set vtjasgo=f_getVtjaJugOro(go,campoid,tee_salida) where id=tarid; 
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_calc_skeenes` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` PROCEDURE `sp_calc_skeenes`(catidp int, fecha_juegop date)
BEGIN
declare parcampo char(250);
 SET sql_mode = 'NO_UNSIGNED_SUBTRACTION';
SET SQL_SAFE_UPDATES = 0;
delete from Skeen_tarjetas where fecha_juego =fecha_juegop and categoriaid=catidp;

 insert into Skeen_tarjetas (`id`, `id_campo`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `h7`, `h8`, `h9`, `h10`, `h11`, `h12`, `h13`, `h14`, `h15`, `h16`, `h17`, `h18`, `jugadorid`, `fecha_cap`, `tee_salida`, `color_tee`, `SO`, `dif`, `estado`, `fecha_juego`, `tipo`, `salidagrupoid`, `categoriaid`, `utiliza`, `slope`, `rating`, `torneoid`, `orden`,hcpcampo)
 SELECT a.`id`, `campoid`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `h7`, `h8`, `h9`, `h10`, `h11`, `h12`, `h13`, `h14`, `h15`, `h16`, `h17`, `h18`, `jugadorid`, `fecha_cap`, `tee_salida`, `color_tee`, `SO`, `dif`, `estado`, `fecha_juego`, `tipo`, `salidagrupoid`, a.`categoriaid`, `utiliza`, `slope`, `rating`, a.`torneoid`, `orden` 
 ,f_hdccamponeto(b.indexjgo,tee_salida,campoid,Skeenporcent) handicapcampo
 FROM `tarjetas` a join jugadores b on (b.id=a.jugadorid and skeenjuga=1  and a.categoriaid=catidp and b.estatus='NORMAL'
 and a.fecha_juego =fecha_juegop and a.id not in (select id from Skeen_tarjetas)   )
 join categorias as c on (a.categoriaid=c.categoria_id );

 
 update Skeen_tarjetas set ventajas_json=concat(f_getventajajug(hcpcampo,id_campo,tee_salida),'so'), sa=so-hcpcampo where fecha_juego =fecha_juegop and categoriaid=catidp ;
 update Skeen_tarjetas set 
  h1_a=(h1-f_extract_array(ventajas_json,1)),h2_a=(h2-f_extract_array(ventajas_json,2)),h3_a=(h3-f_extract_array(ventajas_json,3)),
h4_a=(h4-f_extract_array(ventajas_json,4)),h5_a=(h5-f_extract_array(ventajas_json,5)),h6_a=(h6-f_extract_array(ventajas_json,6)),
h7_a=(h7-f_extract_array(ventajas_json,7)),h8_a=(h8-f_extract_array(ventajas_json,8)),h9_a=(h9-f_extract_array(ventajas_json,9)),
h10_a=(h10-f_extract_array(ventajas_json,10)),h11_a=(h11-f_extract_array(ventajas_json,11)),h12_a=(h12-f_extract_array(ventajas_json,12)),
h13_a=(h13-f_extract_array(ventajas_json,13)),h14_a=(h14-f_extract_array(ventajas_json,14)),h15_a=(h15-f_extract_array(ventajas_json,15)),
h16_a=(h16-f_extract_array(ventajas_json,16)),h17_a=(h17-f_extract_array(ventajas_json,17)),h18_a=(h18-f_extract_array(ventajas_json,18))
where fecha_juego =fecha_juegop and categoriaid=catidp ;
 
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_reseteatar` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`tomas.obeso`@`%` PROCEDURE `sp_reseteatar`(taridp int)
BEGIN
declare estilojgo  char(30);

SELECT c.estilojuego into estilojgo FROM torneos.tarjetas  as a JOIN salidagrupo AS b on (a.salidagrupoid=b.id) join caljuego as c on (b.caljuegoid=c.id)  WHERE a.`id` = taridp; 

	UPDATE `torneos`.`tarjetas` SET `h1` = '0', `h2` = '0', `h3` = '0', `h4` = '0', `h5` = '0', `h6` = '0', `h7` = '0', `h8` = '0', `h9` = '0', `h10` = '0', `h11` = '0', `h12` = '0', `h13` = '0', `h14` = '0', `h15` = '0', `h16` = '0', `h17` = '0', `h18` = '0', `h1_a` = '0', `h2_a` = '0', `h3_a` = '0', `h4_a` = '0', `h5_a` = '0', `h6_a` = '0', `h8_a` = '0', `h9_a` = '0', `h10_a` = '0', `h14_a` = '0', `h15_a` = '0', `h16_a` = '0', `h18_a` = '0', `SO` = '0', `SA` = '0', `arso` = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0', `arsa` = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0', `arsap` = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0', `arstbgross` = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0', `ventajas` = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0', `vtjasgo` = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'
	 WHERE `id` = taridp;

 
if(estilojgo='Go Go') THEN BEGIN 
	update   tarjetas as a join jugadores as b on (a.jugadorid=b.id)  
	 join v_handicap_gogo as v on (b.torneoid=v.torneoid and b.categoriaid=v.categoriaid and b.numjugador=v.numjugador)
	 set a.hcampo=v.hcampo 
	  where   a.id=taridp	;
END; END IF;

if(estilojgo<>'Go Go') THEN BEGIN 
	update tarjetas as a join jugadores as b on (a.jugadorid=b.id) join categorias as c on (b.categoriaid=c.categoria_id)
 set a.hcampo=f_hdccamponeto(b.indexjgo,b.teesalidaid,a.campoid,c.porcentaje)
 where a.id=taridp	;
END; END IF;
   
   
  #select *, f_parcampo(a.campoid, teesalidaid), f_getventajajug(a.hcampo,a.campoid,teesalidaid)  
  update  tarjetas as a join jugadores as b on (a.jugadorid=b.id) 
 set parcampohoyo=f_parcampo(a.campoid, b.teesalidaid),ventajas= f_getventajajug(a.hcampo,a.campoid,b.teesalidaid) 
 where a.id=taridp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `result_ult_tar`
--

/*!50001 DROP VIEW IF EXISTS `result_ult_tar`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `result_ult_tar` AS select `a`.`jugadorid` AS `jugadorid`,`a`.`tarjetaid` AS `tarjetaid`,`b`.`h18` + `b`.`h17` + `b`.`h16` + `b`.`h15` + `b`.`h14` + `b`.`h13` + `b`.`h12` + `b`.`h11` + `b`.`h10` AS `v2` from (`v_ult_tarjeta` `a` join `tarjetas` `b` on(`a`.`tarjetaid` = `b`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_approach`
--

/*!50001 DROP VIEW IF EXISTS `v_approach`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_approach` AS select distinct `approach`.`torneoid` AS `torneoid`,`approach`.`campo` AS `campo`,`approach`.`categoriaid` AS `categoriaid`,`approach`.`descripcion` AS `descripcion`,`approach`.`premio` AS `premio` from `approach` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_approach_jugadores`
--

/*!50001 DROP VIEW IF EXISTS `v_approach_jugadores`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_approach_jugadores` AS select `a`.`torneoid` AS `torneoid`,`a`.`campo` AS `campo`,`a`.`hoyo` AS `hoyo`,`a`.`premio` AS `premio`,`b`.`id` AS `jugadorid`,`b`.`nombre` AS `nombre`,`b`.`apellido` AS `apellido`,`b`.`club` AS `club`,`b`.`estatus` AS `estatus`,`b`.`categoriaid` AS `categoriaid`,`c`.`categoria` AS `categoria`,`b`.`grupoid` AS `grupoid` from ((`approach` `a` join `jugadores` `b` on(`a`.`categoriaid` = `b`.`categoriaid` and `a`.`torneoid` = `b`.`torneoid`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) group by `a`.`torneoid`,`a`.`campo`,`a`.`hoyo`,`a`.`premio`,`b`.`id`,`b`.`nombre`,`b`.`apellido`,`b`.`club`,`b`.`estatus`,`b`.`categoriaid`,`c`.`categoria`,`b`.`grupoid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_approachjug`
--

/*!50001 DROP VIEW IF EXISTS `v_approachjug`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_approachjug` AS select `a`.`id` AS `id`,`d`.`campo` AS `campo`,`a`.`hoyo` AS `hoyo`,`a`.`premio` AS `premio`,`a`.`fecha` AS `fecha`,concat(`b`.`apellido`,' ',`b`.`nombre`) AS `jugador`,`c`.`categoria` AS `categoria`,`a`.`distancia` AS `distancia`,`b`.`id` AS `jugadorid`,`a`.`torneoid` AS `torneoid`,`p`.`descripcion` AS `descripcion` from ((((`approachjug` `a` join `jugadores` `b` on(`a`.`jugadorid` = `b`.`id`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) join `campos` `d` on(`d`.`id` = `a`.`campo`)) join `approach` `p` on(`p`.`torneoid` = `a`.`torneoid` and `p`.`campo` = `a`.`campo` and `a`.`categoriaid` = `p`.`categoriaid` and `a`.`premiosjugcol` = `p`.`descripcion`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_approachunico`
--

/*!50001 DROP VIEW IF EXISTS `v_approachunico`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_approachunico` AS select `approachjug`.`torneoid` AS `torneoid`,`approachjug`.`jugadorid` AS `jugadorid`,min(`approachjug`.`distancia`) AS `mindistancia` from `approachjug` group by `approachjug`.`torneoid`,`approachjug`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_aproachunico`
--

/*!50001 DROP VIEW IF EXISTS `v_aproachunico`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_aproachunico` AS select `approachjug`.`torneoid` AS `torneoid`,`approachjug`.`jugadorid` AS `jugadorid`,min(`approachjug`.`distancia`) AS `mindistancia` from `approachjug` group by `approachjug`.`torneoid`,`approachjug`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_caljgo_salgpo`
--

/*!50001 DROP VIEW IF EXISTS `v_caljgo_salgpo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_caljgo_salgpo` AS select distinct `salidagrupo`.`caljuegoid` AS `caljuegoid` from `salidagrupo` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_campeon_gross`
--

/*!50001 DROP VIEW IF EXISTS `v_campeon_gross`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_campeon_gross` AS select `a`.`jugadorid` AS `jugadorid`,`a`.`categoriaid` AS `categoriaid`,concat(`b`.`nombre`,' ',`b`.`apellido`) AS `jugador`,`b`.`estatus` AS `estatjug`,`b`.`club` AS `club`,`b`.`campgross` AS `campgross`,`b`.`muertesubita` AS `muertesubita`,`b`.`grupoid` AS `grupoid`,`b`.`cd1` AS `cd1`,`b`.`cd2` AS `cd2`,`b`.`cd3` AS `cd3`,`b`.`cd4` AS `cd4`,`b`.`cd5` AS `cd5`,`b`.`cd6` AS `cd6`,sum(`a`.`SA`) AS `neto`,sum(`a`.`SA`) AS `gross`,`cl`.`logo` AS `logojug` from ((((`tarjetas` `a` join `jugadores` `b` on(`a`.`jugadorid` = `b`.`id` and `b`.`estatus` = 'NORMAL')) join `clubs` `cl` on(`b`.`clubid` = `cl`.`id`)) join `v_cd_ulttar` `c` on(`c`.`jugadorid` = `b`.`id`)) join `result_ult_tar` `d` on(`c`.`jugadorid` = `d`.`jugadorid`)) where 1 group by `a`.`jugadorid`,`a`.`categoriaid`,`b`.`nombre`,`b`.`apellido`,`b`.`estatus`,`b`.`club`,`b`.`campgross`,`b`.`muertesubita`,`b`.`cd1`,`b`.`cd2`,`b`.`cd3`,`b`.`cd4`,`b`.`cd5`,`b`.`cd6` order by `b`.`estatus` desc,sum(`a`.`SA`) desc,`b`.`muertesubita` desc,`b`.`cd4` + `b`.`cd5` + `b`.`cd3` + `b`.`cd2` + `b`.`cd1` desc,`b`.`cd4` + `b`.`cd3` + `b`.`cd2` + `b`.`cd1` desc,`b`.`cd3` + `b`.`cd2` + `b`.`cd1` desc,`b`.`cd3` desc,`b`.`cd2` desc,`b`.`cd1` desc,`b`.`cd6` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_campeon_gross_stoke`
--

/*!50001 DROP VIEW IF EXISTS `v_campeon_gross_stoke`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_campeon_gross_stoke` AS select `a`.`jugadorid` AS `jugadorid`,`a`.`categoriaid` AS `categoriaid`,concat(`b`.`nombre`,' ',`b`.`apellido`) AS `jugador`,`b`.`estatus` AS `estatjug`,`b`.`club` AS `club`,`b`.`campgross` AS `campgross`,`b`.`muertesubita` AS `muertesubita`,`b`.`grupoid` AS `grupoid`,`b`.`cd1` AS `cd1`,`b`.`cd2` AS `cd2`,`b`.`cd3` AS `cd3`,`b`.`cd4` AS `cd4`,`b`.`cd5` AS `cd5`,`b`.`cd6` AS `cd6`,sum(`a`.`SA`) AS `neto`,sum(`a`.`SO`) AS `gross`,`cl`.`logo` AS `logojug` from ((((`tarjetas` `a` join `jugadores` `b` on(`a`.`jugadorid` = `b`.`id` and `b`.`estatus` = 'NORMAL')) join `clubs` `cl` on(`b`.`clubid` = `cl`.`id`)) join `v_cd_ulttar` `c` on(`c`.`jugadorid` = `b`.`id`)) join `result_ult_tar` `d` on(`c`.`jugadorid` = `d`.`jugadorid`)) where 1 group by `a`.`jugadorid`,`a`.`categoriaid`,`b`.`nombre`,`b`.`apellido`,`b`.`estatus`,`b`.`club`,`b`.`campgross`,`b`.`muertesubita`,`b`.`cd1`,`b`.`cd2`,`b`.`cd3`,`b`.`cd4`,`b`.`cd5`,`b`.`cd6` order by `b`.`estatus` desc,sum(`a`.`SO`),`b`.`muertesubita` desc,`b`.`cd4` + `b`.`cd5` + `b`.`cd3` + `b`.`cd2` + `b`.`cd1`,`b`.`cd4` + `b`.`cd3` + `b`.`cd2` + `b`.`cd1`,`b`.`cd3` + `b`.`cd2` + `b`.`cd1`,`b`.`cd3`,`b`.`cd2`,`b`.`cd1`,`b`.`cd6` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_cd_ulttar`
--

/*!50001 DROP VIEW IF EXISTS `v_cd_ulttar`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_cd_ulttar` AS select `a`.`torneoid` AS `torneoid`,`a`.`jugadorid` AS `jugadorid`,`b`.`h18_a` AS `c1`,`b`.`h17_a` AS `c2`,`b`.`h16_a` AS `c3`,`b`.`h15_a` + `b`.`h14_a` + `b`.`h13_a` AS `c4`,`b`.`h12_a` + `b`.`h11_a` + `b`.`h10_a` AS `c5`,`b`.`h1_a` + `b`.`h2_a` + `b`.`h3_a` + `b`.`h4_a` + `b`.`h5_a` + `b`.`h6_a` + `b`.`h7_a` + `b`.`h8_a` + `b`.`h9_a` AS `c6` from (`v_ult_tarjeta_sin0` `a` join `tarjetas` `b` on(`a`.`tarjetaid` = `b`.`id` and `b`.`statlsc` = 1)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_cd_ulttar_sa`
--

/*!50001 DROP VIEW IF EXISTS `v_cd_ulttar_sa`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_cd_ulttar_sa` AS select `a`.`torneoid` AS `torneoid`,`a`.`jugadorid` AS `jugadorid`,`b`.`h18_a` AS `c1`,`b`.`h17_a` AS `c2`,`b`.`h16_a` AS `c3`,`b`.`h15_a` + `b`.`h14_a` + `b`.`h13_a` AS `c4`,`b`.`h12_a` + `b`.`h11_a` + `b`.`h10_a` AS `c5`,`b`.`h1_a` + `b`.`h2_a` + `b`.`h3_a` + `b`.`h4_a` + `b`.`h5_a` + `b`.`h6_a` + `b`.`h7_a` + `b`.`h8_a` + `b`.`h9_a` AS `c6` from (`v_ult_tarjeta_sin0` `a` join `tarjetas` `b` on(`a`.`tarjetaid` = `b`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_cd_ulttar_so`
--

/*!50001 DROP VIEW IF EXISTS `v_cd_ulttar_so`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_cd_ulttar_so` AS select `a`.`torneoid` AS `torneoid`,`a`.`jugadorid` AS `jugadorid`,`b`.`h18` AS `c1`,`b`.`h17` AS `c2`,`b`.`h16` AS `c3`,`b`.`h15` + `b`.`h14` + `b`.`h13` AS `c4`,`b`.`h12` + `b`.`h11` + `b`.`h10` AS `c5`,`b`.`h1` + `b`.`h2` + `b`.`h3` + `b`.`h4` + `b`.`h5` + `b`.`h6` + `b`.`h7` + `b`.`h8` + `b`.`h9` AS `c6` from (`v_ult_tarjeta_sin0` `a` join `tarjetas` `b` on(`a`.`tarjetaid` = `b`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_clubs_torneo`
--

/*!50001 DROP VIEW IF EXISTS `v_clubs_torneo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_clubs_torneo` AS select distinct `a`.`id` AS `id`,`a`.`torneoid` AS `torneoid`,`a`.`clubid` AS `clubid`,`b`.`nombre` AS `nombre` from (`clubs_registro` `a` join `clubs` `b` on(`a`.`clubid` = `b`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_diasjgo`
--

/*!50001 DROP VIEW IF EXISTS `v_diasjgo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_diasjgo` AS select `a`.`torneoid` AS `torneoid`,`a`.`categoria` AS `categoria`,min(`a`.`fecha`) AS `INICIA`,max(`a`.`fecha`) AS `TERMINA`,count(0) AS `diasjgo`,`b`.`categoria_id` AS `categoria_id` from (`caljuego` `a` join `categorias` `b` on(`a`.`torneoid` = `b`.`torneo_id` and `a`.`categoria` = `b`.`categoria`)) where `a`.`campo` > 0 group by `a`.`torneoid`,`a`.`categoria`,`b`.`categoria_id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_diasjgo_categoria`
--

/*!50001 DROP VIEW IF EXISTS `v_diasjgo_categoria`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_diasjgo_categoria` AS select `a`.`categoriaid` AS `categoriaid`,`a`.`diajuegoid` AS `diajuegoid`,`b`.`fecha` AS `fecha` from (`salidasTorneo` `a` join `diasjuego` `b` on(`a`.`diajuegoid` = `b`.`id`)) order by `b`.`fecha` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_difpar_jugador`
--

/*!50001 DROP VIEW IF EXISTS `v_difpar_jugador`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_difpar_jugador` AS select `a`.`jugadorid` AS `jugadorid`,sum(if(`a`.`h1` > 0,cast(`a`.`h1` as signed) - cast(`b`.`h1` as signed),0) + if(`a`.`h2` > 0,cast(`a`.`h2` as signed) - cast(`b`.`h2` as signed),0) + if(`a`.`h3` > 0,cast(`a`.`h3` as signed) - cast(`b`.`h3` as signed),0) + if(`a`.`h4` > 0,cast(`a`.`h4` as signed) - cast(`b`.`h4` as signed),0) + if(`a`.`h5` > 0,cast(`a`.`h5` as signed) - cast(`b`.`h5` as signed),0) + if(`a`.`h6` > 0,cast(`a`.`h6` as signed) - cast(`b`.`h6` as signed),0) + if(`a`.`h7` > 0,cast(`a`.`h7` as signed) - cast(`b`.`h7` as signed),0) + if(`a`.`h8` > 0,cast(`a`.`h8` as signed) - cast(`b`.`h8` as signed),0) + if(`a`.`h9` > 0,cast(`a`.`h9` as signed) - cast(`b`.`h9` as signed),0) + if(`a`.`h10` > 0,cast(`a`.`h10` as signed) - cast(`b`.`h10` as signed),0) + if(`a`.`h11` > 0,cast(`a`.`h11` as signed) - cast(`b`.`h11` as signed),0) + if(`a`.`h12` > 0,cast(`a`.`h12` as signed) - cast(`b`.`h12` as signed),0) + if(`a`.`h13` > 0,cast(`a`.`h13` as signed) - cast(`b`.`h13` as signed),0) + if(`a`.`h14` > 0,cast(`a`.`h14` as signed) - cast(`b`.`h14` as signed),0) + if(`a`.`h15` > 0,cast(`a`.`h15` as signed) - cast(`b`.`h15` as signed),0) + if(`a`.`h16` > 0,cast(`a`.`h16` as signed) - cast(`b`.`h16` as signed),0) + if(`a`.`h17` > 0,cast(`a`.`h17` as signed) - cast(`b`.`h17` as signed),0) + if(`a`.`h18` > 0,cast(`a`.`h18` as signed) - cast(`b`.`h18` as signed),0)) AS `difpar` from (`tarjetas` `a` join `par_campo` `b` on(`a`.`campoid` = `b`.`id_campo`)) where 1 group by `a`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_difpar_jugadorGO`
--

/*!50001 DROP VIEW IF EXISTS `v_difpar_jugadorGO`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_difpar_jugadorGO` AS select `a`.`jugadorid` AS `jugadorid`,sum(if(`a`.`h1` > 0,cast(`a`.`h1` as decimal(5,1)) - cast(`b`.`h1` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',1) as decimal(5,1)),0) + if(`a`.`h2` > 0,cast(`a`.`h2` as decimal(5,1)) - cast(`b`.`h2` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',2) as decimal(5,1)),0) + if(`a`.`h3` > 0,cast(`a`.`h3` as decimal(5,1)) - cast(`b`.`h3` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',3) as decimal(5,1)),0) + if(`a`.`h4` > 0,cast(`a`.`h4` as decimal(5,1)) - cast(`b`.`h4` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',4) as decimal(5,1)),0) + if(`a`.`h5` > 0,cast(`a`.`h5` as decimal(5,1)) - cast(`b`.`h5` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',5) as decimal(5,1)),0) + if(`a`.`h6` > 0,cast(`a`.`h6` as decimal(5,1)) - cast(`b`.`h6` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',6) as decimal(5,1)),0) + if(`a`.`h7` > 0,cast(`a`.`h7` as decimal(5,1)) - cast(`b`.`h7` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',7) as decimal(5,1)),0) + if(`a`.`h8` > 0,cast(`a`.`h8` as decimal(5,1)) - cast(`b`.`h8` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',8) as decimal(5,1)),0) + if(`a`.`h9` > 0,cast(`a`.`h9` as decimal(5,1)) - cast(`b`.`h9` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',9) as decimal(5,1)),0) + if(`a`.`h10` > 0,cast(`a`.`h10` as decimal(5,1)) - cast(`b`.`h10` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',10) as decimal(5,1)),0) + if(`a`.`h11` > 0,cast(`a`.`h11` as decimal(5,1)) - cast(`b`.`h11` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',11) as decimal(5,1)),0) + if(`a`.`h12` > 0,cast(`a`.`h12` as decimal(5,1)) - cast(`b`.`h12` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',12) as decimal(5,1)),0) + if(`a`.`h13` > 0,cast(`a`.`h13` as decimal(5,1)) - cast(`b`.`h13` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',13) as decimal(5,1)),0) + if(`a`.`h14` > 0,cast(`a`.`h14` as decimal(5,1)) - cast(`b`.`h14` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',14) as decimal(5,1)),0) + if(`a`.`h15` > 0,cast(`a`.`h15` as decimal(5,1)) - cast(`b`.`h15` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',15) as decimal(5,1)),0) + if(`a`.`h16` > 0,cast(`a`.`h16` as decimal(5,1)) - cast(`b`.`h16` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',16) as decimal(5,1)),0) + if(`a`.`h17` > 0,cast(`a`.`h17` as decimal(5,1)) - cast(`b`.`h17` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',17) as decimal(5,1)),0) + if(`a`.`h18` > 0,cast(`a`.`h18` as decimal(5,1)) - cast(`b`.`h18` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',18) as decimal(5,1)),0)) AS `difpar` from (`tarjetas` `a` join `par_campo` `b` on(`a`.`campoid` = `b`.`id_campo`)) where 1 group by `a`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_difpar_jugador_neto`
--

/*!50001 DROP VIEW IF EXISTS `v_difpar_jugador_neto`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_difpar_jugador_neto` AS select `a`.`jugadorid` AS `jugadorid`,sum(if(`a`.`h1_a` > 0,cast(`a`.`h1_a` as signed) - cast(`b`.`h1` as signed),0) + if(`a`.`h2_a` > 0,cast(`a`.`h2_a` as signed) - cast(`b`.`h2` as signed),0) + if(`a`.`h3_a` > 0,cast(`a`.`h3_a` as signed) - cast(`b`.`h3` as signed),0) + if(`a`.`h4_a` > 0,cast(`a`.`h4_a` as signed) - cast(`b`.`h4` as signed),0) + if(`a`.`h5_a` > 0,cast(`a`.`h5_a` as signed) - cast(`b`.`h5` as signed),0) + if(`a`.`h6_a` > 0,cast(`a`.`h6_a` as signed) - cast(`b`.`h6` as signed),0) + if(`a`.`h7_a` > 0,cast(`a`.`h7_a` as signed) - cast(`b`.`h7` as signed),0) + if(`a`.`h8_a` > 0,cast(`a`.`h8_a` as signed) - cast(`b`.`h8` as signed),0) + if(`a`.`h9_a` > 0,cast(`a`.`h9_a` as signed) - cast(`b`.`h9` as signed),0) + if(`a`.`h10_a` > 0,cast(`a`.`h10_a` as signed) - cast(`b`.`h10` as signed),0) + if(`a`.`h11_a` > 0,cast(`a`.`h11_a` as signed) - cast(`b`.`h11` as signed),0) + if(`a`.`h12_a` > 0,cast(`a`.`h12_a` as signed) - cast(`b`.`h12` as signed),0) + if(`a`.`h13_a` > 0,cast(`a`.`h13_a` as signed) - cast(`b`.`h13` as signed),0) + if(`a`.`h14_a` > 0,cast(`a`.`h14_a` as signed) - cast(`b`.`h14` as signed),0) + if(`a`.`h15_a` > 0,cast(`a`.`h15_a` as signed) - cast(`b`.`h15` as signed),0) + if(`a`.`h16_a` > 0,cast(`a`.`h16_a` as signed) - cast(`b`.`h16` as signed),0) + if(`a`.`h17_a` > 0,cast(`a`.`h17_a` as signed) - cast(`b`.`h17` as signed),0) + if(`a`.`h18_a` > 0,cast(`a`.`h18_a` as signed) - cast(`b`.`h18` as signed),0)) AS `difpar` from (`tarjetas` `a` join `par_campo` `b` on(`a`.`campoid` = `b`.`id_campo`)) where 1 group by `a`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_difpar_jugador_netof`
--

/*!50001 DROP VIEW IF EXISTS `v_difpar_jugador_netof`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_difpar_jugador_netof` AS select `a`.`jugadorid` AS `jugadorid`,sum(if(`a`.`h1_a` > 0,cast(`a`.`h1_a` as signed) - cast(`b`.`h1` as signed),0) + if(`a`.`h2_a` > 0,cast(`a`.`h2_a` as signed) - cast(`b`.`h2` as signed),0) + if(`a`.`h3_a` > 0,cast(`a`.`h3_a` as signed) - cast(`b`.`h3` as signed),0) + if(`a`.`h4_a` > 0,cast(`a`.`h4_a` as signed) - cast(`b`.`h4` as signed),0) + if(`a`.`h5_a` > 0,cast(`a`.`h5_a` as signed) - cast(`b`.`h5` as signed),0) + if(`a`.`h6_a` > 0,cast(`a`.`h6_a` as signed) - cast(`b`.`h6` as signed),0) + if(`a`.`h7_a` > 0,cast(`a`.`h7_a` as signed) - cast(`b`.`h7` as signed),0) + if(`a`.`h8_a` > 0,cast(`a`.`h8_a` as signed) - cast(`b`.`h8` as signed),0) + if(`a`.`h9_a` > 0,cast(`a`.`h9_a` as signed) - cast(`b`.`h9` as signed),0) + if(`a`.`h10_a` > 0,cast(`a`.`h10_a` as signed) - cast(`b`.`h10` as signed),0) + if(`a`.`h11_a` > 0,cast(`a`.`h11_a` as signed) - cast(`b`.`h11` as signed),0) + if(`a`.`h12_a` > 0,cast(`a`.`h12_a` as signed) - cast(`b`.`h12` as signed),0) + if(`a`.`h13_a` > 0,cast(`a`.`h13_a` as signed) - cast(`b`.`h13` as signed),0) + if(`a`.`h14_a` > 0,cast(`a`.`h14_a` as signed) - cast(`b`.`h14` as signed),0) + if(`a`.`h15_a` > 0,cast(`a`.`h15_a` as signed) - cast(`b`.`h15` as signed),0) + if(`a`.`h16_a` > 0,cast(`a`.`h16_a` as signed) - cast(`b`.`h16` as signed),0) + if(`a`.`h17_a` > 0,cast(`a`.`h17_a` as signed) - cast(`b`.`h17` as signed),0) + if(`a`.`h18_a` > 0,cast(`a`.`h18_a` as signed) - cast(`b`.`h18` as signed),0)) AS `difpar` from (`tarjetas` `a` join `par_campo` `b` on(`a`.`campoid` = `b`.`id_campo`)) where `a`.`statlsc` <> 0 group by `a`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_difpar_tarjeta`
--

/*!50001 DROP VIEW IF EXISTS `v_difpar_tarjeta`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_difpar_tarjeta` AS select `a`.`id` AS `tarjetaid`,if(`a`.`h1` > 0,cast(`a`.`h1` as signed) - cast(`b`.`h1` as signed),0) + if(`a`.`h2` > 0,cast(`a`.`h2` as signed) - cast(`b`.`h2` as signed),0) + if(`a`.`h3` > 0,cast(`a`.`h3` as signed) - cast(`b`.`h3` as signed),0) + if(`a`.`h4` > 0,cast(`a`.`h4` as signed) - cast(`b`.`h4` as signed),0) + if(`a`.`h5` > 0,cast(`a`.`h5` as signed) - cast(`b`.`h5` as signed),0) + if(`a`.`h6` > 0,cast(`a`.`h6` as signed) - cast(`b`.`h6` as signed),0) + if(`a`.`h7` > 0,cast(`a`.`h7` as signed) - cast(`b`.`h7` as signed),0) + if(`a`.`h8` > 0,cast(`a`.`h8` as signed) - cast(`b`.`h8` as signed),0) + if(`a`.`h9` > 0,cast(`a`.`h9` as signed) - cast(`b`.`h9` as signed),0) + if(`a`.`h10` > 0,cast(`a`.`h10` as signed) - cast(`b`.`h10` as signed),0) + if(`a`.`h11` > 0,cast(`a`.`h11` as signed) - cast(`b`.`h11` as signed),0) + if(`a`.`h12` > 0,cast(`a`.`h12` as signed) - cast(`b`.`h12` as signed),0) + if(`a`.`h13` > 0,cast(`a`.`h13` as signed) - cast(`b`.`h13` as signed),0) + if(`a`.`h14` > 0,cast(`a`.`h14` as signed) - cast(`b`.`h14` as signed),0) + if(`a`.`h15` > 0,cast(`a`.`h15` as signed) - cast(`b`.`h15` as signed),0) + if(`a`.`h16` > 0,cast(`a`.`h16` as signed) - cast(`b`.`h16` as signed),0) + if(`a`.`h17` > 0,cast(`a`.`h17` as signed) - cast(`b`.`h17` as signed),0) + if(`a`.`h18` > 0,cast(`a`.`h18` as signed) - cast(`b`.`h18` as signed),0) AS `difpar` from (`tarjetas` `a` join `par_campo` `b` on(`a`.`campoid` = `b`.`id_campo`)) where 1 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_difpar_tarjeta_stb`
--

/*!50001 DROP VIEW IF EXISTS `v_difpar_tarjeta_stb`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_difpar_tarjeta_stb` AS select `a`.`id` AS `tarjetaid`,if(`a`.`h1` > 0,cast(`a`.`h1_a` as signed) - 2,0) + if(`a`.`h2` > 0,cast(`a`.`h2_a` as signed) - 2,0) + if(`a`.`h3` > 0,cast(`a`.`h3_a` as signed) - 2,0) + if(`a`.`h4` > 0,cast(`a`.`h4_a` as signed) - 2,0) + if(`a`.`h5` > 0,cast(`a`.`h5_a` as signed) - 2,0) + if(`a`.`h6` > 0,cast(`a`.`h6_a` as signed) - 2,0) + if(`a`.`h7` > 0,cast(`a`.`h7` as signed) - 2,0) + if(`a`.`h8` > 0,cast(`a`.`h8` as signed) - 2,0) + if(`a`.`h9` > 0,cast(`a`.`h9` as signed) - 2,0) + if(`a`.`h10` > 0,cast(`a`.`h10_a` as signed) - 2,0) + if(`a`.`h11` > 0,cast(`a`.`h11_a` as signed) - 2,0) + if(`a`.`h12` > 0,cast(`a`.`h12_a` as signed) - 2,0) + if(`a`.`h13` > 0,cast(`a`.`h13_a` as signed) - 2,0) + if(`a`.`h14` > 0,cast(`a`.`h14_a` as signed) - 2,0) + if(`a`.`h15` > 0,cast(`a`.`h15_a` as signed) - 2,0) + if(`a`.`h16` > 0,cast(`a`.`h16_a` as signed) - 2,0) + if(`a`.`h17` > 0,cast(`a`.`h17_a` as signed) - 2,0) + if(`a`.`h18` > 0,cast(`a`.`h18_a` as signed) - 2,0) AS `difpar` from `tarjetas` `a` where 1 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_difpar_ulttarjeta`
--

/*!50001 DROP VIEW IF EXISTS `v_difpar_ulttarjeta`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_difpar_ulttarjeta` AS select `a`.`id` AS `tarjetaid`,`v`.`jugadorid` AS `jugadorid`,if(`a`.`h1` > 0,1,0) + if(`a`.`h2` > 0,1,0) + if(`a`.`h3` > 0,1,0) + if(`a`.`h4` > 0,1,0) + if(`a`.`h5` > 0,1,0) + if(`a`.`h6` > 0,1,0) + if(`a`.`h7` > 0,1,0) + if(`a`.`h8` > 0,1,0) + if(`a`.`h9` > 0,1,0) + if(`a`.`h10` > 0,1,0) + if(`a`.`h11` > 0,1,0) + if(`a`.`h12` > 0,1,0) + if(`a`.`h13` > 0,1,0) + if(`a`.`h14` > 0,1,0) + if(`a`.`h15` > 0,1,0) + if(`a`.`h16` > 0,1,0) + if(`a`.`h17` > 0,1,0) + if(`a`.`h18` > 0,1,0) AS `avance`,if(`a`.`h1` > 0,cast(`a`.`h1` as signed) - cast(`b`.`h1` as signed),0) + if(`a`.`h2` > 0,cast(`a`.`h2` as signed) - cast(`b`.`h2` as signed),0) + if(`a`.`h3` > 0,cast(`a`.`h3` as signed) - cast(`b`.`h3` as signed),0) + if(`a`.`h4` > 0,cast(`a`.`h4` as signed) - cast(`b`.`h4` as signed),0) + if(`a`.`h5` > 0,cast(`a`.`h5` as signed) - cast(`b`.`h5` as signed),0) + if(`a`.`h6` > 0,cast(`a`.`h6` as signed) - cast(`b`.`h6` as signed),0) + if(`a`.`h7` > 0,cast(`a`.`h7` as signed) - cast(`b`.`h7` as signed),0) + if(`a`.`h8` > 0,cast(`a`.`h8` as signed) - cast(`b`.`h8` as signed),0) + if(`a`.`h9` > 0,cast(`a`.`h9` as signed) - cast(`b`.`h9` as signed),0) + if(`a`.`h10` > 0,cast(`a`.`h10` as signed) - cast(`b`.`h10` as signed),0) + if(`a`.`h11` > 0,cast(`a`.`h11` as signed) - cast(`b`.`h11` as signed),0) + if(`a`.`h12` > 0,cast(`a`.`h12` as signed) - cast(`b`.`h12` as signed),0) + if(`a`.`h13` > 0,cast(`a`.`h13` as signed) - cast(`b`.`h13` as signed),0) + if(`a`.`h14` > 0,cast(`a`.`h14` as signed) - cast(`b`.`h14` as signed),0) + if(`a`.`h15` > 0,cast(`a`.`h15` as signed) - cast(`b`.`h15` as signed),0) + if(`a`.`h16` > 0,cast(`a`.`h16` as signed) - cast(`b`.`h16` as signed),0) + if(`a`.`h17` > 0,cast(`a`.`h17` as signed) - cast(`b`.`h17` as signed),0) + if(`a`.`h18` > 0,cast(`a`.`h18` as signed) - cast(`b`.`h18` as signed),0) AS `difpar_ulttar`,`a`.`SA` AS `sa` from ((`tarjetas` `a` join `v_ult_tarjeta0` `v` on(`a`.`id` = `v`.`tarjetaid`)) join `par_campo` `b` on(`a`.`campoid` = `b`.`id_campo`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_difpar_ulttarjeta_neto`
--

/*!50001 DROP VIEW IF EXISTS `v_difpar_ulttarjeta_neto`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_difpar_ulttarjeta_neto` AS select `a`.`id` AS `tarjetaid`,`v`.`jugadorid` AS `jugadorid`,if(`a`.`h1` > 0,1,0) + if(`a`.`h2` > 0,1,0) + if(`a`.`h3` > 0,1,0) + if(`a`.`h4` > 0,1,0) + if(`a`.`h5` > 0,1,0) + if(`a`.`h6` > 0,1,0) + if(`a`.`h7` > 0,1,0) + if(`a`.`h8` > 0,1,0) + if(`a`.`h9` > 0,1,0) + if(`a`.`h10` > 0,1,0) + if(`a`.`h11` > 0,1,0) + if(`a`.`h12` > 0,1,0) + if(`a`.`h13` > 0,1,0) + if(`a`.`h14` > 0,1,0) + if(`a`.`h15` > 0,1,0) + if(`a`.`h16` > 0,1,0) + if(`a`.`h17` > 0,1,0) + if(`a`.`h18` > 0,1,0) AS `avance`,if(`a`.`h1` > 0,cast(`a`.`h1` as signed) - cast(`b`.`h1` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,1),0) + if(`a`.`h2` > 0,cast(`a`.`h2` as signed) - cast(`b`.`h2` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,2),0) + if(`a`.`h3` > 0,cast(`a`.`h3` as signed) - cast(`b`.`h3` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,3),0) + if(`a`.`h4` > 0,cast(`a`.`h4` as signed) - cast(`b`.`h4` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,4),0) + if(`a`.`h5` > 0,cast(`a`.`h5` as signed) - cast(`b`.`h5` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,5),0) + if(`a`.`h6` > 0,cast(`a`.`h6` as signed) - cast(`b`.`h6` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,6),0) + if(`a`.`h7` > 0,cast(`a`.`h7` as signed) - cast(`b`.`h7` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,7),0) + if(`a`.`h8` > 0,cast(`a`.`h8` as signed) - cast(`b`.`h8` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,8),0) + if(`a`.`h9` > 0,cast(`a`.`h9` as signed) - cast(`b`.`h9` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,9),0) + if(`a`.`h10` > 0,cast(`a`.`h10` as signed) - cast(`b`.`h10` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,10),0) + if(`a`.`h11` > 0,cast(`a`.`h11` as signed) - cast(`b`.`h11` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,11),0) + if(`a`.`h12` > 0,cast(`a`.`h12` as signed) - cast(`b`.`h12` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,12),0) + if(`a`.`h13` > 0,cast(`a`.`h13` as signed) - cast(`b`.`h13` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,13),0) + if(`a`.`h14` > 0,cast(`a`.`h14` as signed) - cast(`b`.`h14` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,14),0) + if(`a`.`h15` > 0,cast(`a`.`h15` as signed) - cast(`b`.`h15` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,15),0) + if(`a`.`h16` > 0,cast(`a`.`h16` as signed) - cast(`b`.`h16` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,16),0) + if(`a`.`h17` > 0,cast(`a`.`h17` as signed) - cast(`b`.`h17` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,17),0) + if(`a`.`h18` > 0,cast(`a`.`h18` as signed) - cast(`b`.`h18` as signed) - `F_GETVENTAJAJUG_HOYO`(`a`.`hcampo`,`a`.`campoid`,`a`.`tee_salida`,18),0) AS `difpar_ulttar`,`a`.`SA` AS `sa` from ((`tarjetas` `a` join `v_ult_tarjeta0` `v` on(`a`.`id` = `v`.`tarjetaid`)) join `par_campo` `b` on(`a`.`campoid` = `b`.`id_campo`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_difpar_ulttarjeta_stb`
--

/*!50001 DROP VIEW IF EXISTS `v_difpar_ulttarjeta_stb`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_difpar_ulttarjeta_stb` AS select `a`.`id` AS `tarjetaid`,`v`.`jugadorid` AS `jugadorid`,if(`a`.`h1` > 0,1,0) + if(`a`.`h2` > 0,1,0) + if(`a`.`h3` > 0,1,0) + if(`a`.`h4` > 0,1,0) + if(`a`.`h5` > 0,1,0) + if(`a`.`h6` > 0,1,0) + if(`a`.`h7` > 0,1,0) + if(`a`.`h8` > 0,1,0) + if(`a`.`h9` > 0,1,0) + if(`a`.`h10` > 0,1,0) + if(`a`.`h11` > 0,1,0) + if(`a`.`h12` > 0,1,0) + if(`a`.`h13` > 0,1,0) + if(`a`.`h14` > 0,1,0) + if(`a`.`h15` > 0,1,0) + if(`a`.`h16` > 0,1,0) + if(`a`.`h17` > 0,1,0) + if(`a`.`h18` > 0,1,0) AS `avance`,if(`a`.`h1` > 0,cast(`a`.`h1_a` as signed) - 2,0) + if(`a`.`h2` > 0,cast(`a`.`h2_a` as signed) - 2,0) + if(`a`.`h3` > 0,cast(`a`.`h3_a` as signed) - 2,0) + if(`a`.`h4` > 0,cast(`a`.`h4_a` as signed) - 2,0) + if(`a`.`h5` > 0,cast(`a`.`h5_a` as signed) - 2,0) + if(`a`.`h6` > 0,cast(`a`.`h6_a` as signed) - 2,0) + if(`a`.`h7` > 0,cast(`a`.`h7` as signed) - 2,0) + if(`a`.`h8` > 0,cast(`a`.`h8` as signed) - 2,0) + if(`a`.`h9` > 0,cast(`a`.`h9` as signed) - 2,0) + if(`a`.`h10` > 0,cast(`a`.`h10_a` as signed) - 2,0) + if(`a`.`h11` > 0,cast(`a`.`h11_a` as signed) - 2,0) + if(`a`.`h12` > 0,cast(`a`.`h12_a` as signed) - 2,0) + if(`a`.`h13` > 0,cast(`a`.`h13_a` as signed) - 2,0) + if(`a`.`h14` > 0,cast(`a`.`h14_a` as signed) - 2,0) + if(`a`.`h15` > 0,cast(`a`.`h15_a` as signed) - 2,0) + if(`a`.`h16` > 0,cast(`a`.`h16_a` as signed) - 2,0) + if(`a`.`h17` > 0,cast(`a`.`h17_a` as signed) - 2,0) + if(`a`.`h18` > 0,cast(`a`.`h18_a` as signed) - 2,0) AS `difpar_ulttar`,`a`.`SA` AS `sa` from (`tarjetas` `a` join `v_ult_tarjeta0` `v` on(`a`.`id` = `v`.`tarjetaid`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_difpar_ulttarjetago`
--

/*!50001 DROP VIEW IF EXISTS `v_difpar_ulttarjetago`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_difpar_ulttarjetago` AS select `a`.`id` AS `tarjetaid`,`v`.`jugadorid` AS `jugadorid`,if(`a`.`h1` > 0,1,0) + if(`a`.`h2` > 0,1,0) + if(`a`.`h3` > 0,1,0) + if(`a`.`h4` > 0,1,0) + if(`a`.`h5` > 0,1,0) + if(`a`.`h6` > 0,1,0) + if(`a`.`h7` > 0,1,0) + if(`a`.`h8` > 0,1,0) + if(`a`.`h9` > 0,1,0) + if(`a`.`h10` > 0,1,0) + if(`a`.`h11` > 0,1,0) + if(`a`.`h12` > 0,1,0) + if(`a`.`h13` > 0,1,0) + if(`a`.`h14` > 0,1,0) + if(`a`.`h15` > 0,1,0) + if(`a`.`h16` > 0,1,0) + if(`a`.`h17` > 0,1,0) + if(`a`.`h18` > 0,1,0) AS `avance`,if(`a`.`h1` > 0,cast(`a`.`h1` as decimal(5,1)) - cast(`b`.`h1` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',1) as decimal(5,1)),0) + if(`a`.`h2` > 0,cast(`a`.`h2` as decimal(5,1)) - cast(`b`.`h2` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',2) as decimal(5,1)),0) + if(`a`.`h3` > 0,cast(`a`.`h3` as decimal(5,1)) - cast(`b`.`h3` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',3) as decimal(5,1)),0) + if(`a`.`h4` > 0,cast(`a`.`h4` as decimal(5,1)) - cast(`b`.`h4` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',4) as decimal(5,1)),0) + if(`a`.`h5` > 0,cast(`a`.`h5` as decimal(5,1)) - cast(`b`.`h5` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',5) as decimal(5,1)),0) + if(`a`.`h6` > 0,cast(`a`.`h6` as decimal(5,1)) - cast(`b`.`h6` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',6) as decimal(5,1)),0) + if(`a`.`h7` > 0,cast(`a`.`h7` as decimal(5,1)) - cast(`b`.`h7` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',7) as decimal(5,1)),0) + if(`a`.`h8` > 0,cast(`a`.`h8` as decimal(5,1)) - cast(`b`.`h8` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',8) as decimal(5,1)),0) + if(`a`.`h9` > 0,cast(`a`.`h9` as decimal(5,1)) - cast(`b`.`h9` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',9) as decimal(5,1)),0) + if(`a`.`h10` > 0,cast(`a`.`h10` as decimal(5,1)) - cast(`b`.`h10` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',10) as decimal(5,1)),0) + if(`a`.`h11` > 0,cast(`a`.`h11` as decimal(5,1)) - cast(`b`.`h11` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',11) as decimal(5,1)),0) + if(`a`.`h12` > 0,cast(`a`.`h12` as decimal(5,1)) - cast(`b`.`h12` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',12) as decimal(5,1)),0) + if(`a`.`h13` > 0,cast(`a`.`h13` as decimal(5,1)) - cast(`b`.`h13` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',13) as decimal(5,1)),0) + if(`a`.`h14` > 0,cast(`a`.`h14` as decimal(5,1)) - cast(`b`.`h14` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',14) as decimal(5,1)),0) + if(`a`.`h15` > 0,cast(`a`.`h15` as decimal(5,1)) - cast(`b`.`h15` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',15) as decimal(5,1)),0) + if(`a`.`h16` > 0,cast(`a`.`h16` as decimal(5,1)) - cast(`b`.`h16` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',16) as decimal(5,1)),0) + if(`a`.`h17` > 0,cast(`a`.`h17` as decimal(5,1)) - cast(`b`.`h17` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',17) as decimal(5,1)),0) + if(`a`.`h18` > 0,cast(`a`.`h18` as decimal(5,1)) - cast(`b`.`h18` as decimal(5,1)) - cast(`f_getVtajaHoyo`(`a`.`vtjasgo`,',',18) as decimal(5,1)),0) AS `difpar_ulttar`,`a`.`SA` AS `sa` from ((`tarjetas` `a` join `v_ult_tarjeta0` `v` on(`a`.`id` = `v`.`tarjetaid`)) join `par_campo` `b` on(`a`.`campoid` = `b`.`id_campo`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_difpar_ulttarjetasa`
--

/*!50001 DROP VIEW IF EXISTS `v_difpar_ulttarjetasa`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_difpar_ulttarjetasa` AS select `a`.`id` AS `tarjetaid`,if(`a`.`h1_a` > 0,cast(`a`.`h1_a` as signed) - cast(`b`.`h1` as signed),0) + if(`a`.`h2_a` > 0,cast(`a`.`h2` as signed) - cast(`b`.`h2` as signed),0) + if(`a`.`h3_a` > 0,cast(`a`.`h3` as signed) - cast(`b`.`h3` as signed),0) + if(`a`.`h4_a` > 0,cast(`a`.`h4` as signed) - cast(`b`.`h4` as signed),0) + if(`a`.`h5_a` > 0,cast(`a`.`h5` as signed) - cast(`b`.`h5` as signed),0) + if(`a`.`h6_a` > 0,cast(`a`.`h6` as signed) - cast(`b`.`h6` as signed),0) + if(`a`.`h7_a` > 0,cast(`a`.`h7` as signed) - cast(`b`.`h7` as signed),0) + if(`a`.`h8_a` > 0,cast(`a`.`h8` as signed) - cast(`b`.`h8` as signed),0) + if(`a`.`h9_a` > 0,cast(`a`.`h9` as signed) - cast(`b`.`h9` as signed),0) + if(`a`.`h10_a` > 0,cast(`a`.`h10` as signed) - cast(`b`.`h10` as signed),0) + if(`a`.`h11_a` > 0,cast(`a`.`h11` as signed) - cast(`b`.`h11` as signed),0) + if(`a`.`h12_a` > 0,cast(`a`.`h12` as signed) - cast(`b`.`h12` as signed),0) + if(`a`.`h13_a` > 0,cast(`a`.`h13` as signed) - cast(`b`.`h13` as signed),0) + if(`a`.`h14_a` > 0,cast(`a`.`h14` as signed) - cast(`b`.`h14` as signed),0) + if(`a`.`h15_a` > 0,cast(`a`.`h15` as signed) - cast(`b`.`h15` as signed),0) + if(`a`.`h16_a` > 0,cast(`a`.`h16` as signed) - cast(`b`.`h16` as signed),0) + if(`a`.`h17_a` > 0,cast(`a`.`h17` as signed) - cast(`b`.`h17` as signed),0) + if(`a`.`h18_a` > 0,cast(`a`.`h18` as signed) - cast(`b`.`h18` as signed),0) AS `difpar` from (`tarjetas` `a` join `par_campo` `b` on(`a`.`campoid` = `b`.`id_campo`)) where 1 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_dribver`
--

/*!50001 DROP VIEW IF EXISTS `v_dribver`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_dribver` AS select distinct `driver`.`torneoid` AS `torneoid`,`driver`.`campo` AS `campo`,`driver`.`categoriaid` AS `categoriaid`,`driver`.`descripcion` AS `descripcion` from `driver` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_driver`
--

/*!50001 DROP VIEW IF EXISTS `v_driver`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_driver` AS select distinct `driver`.`torneoid` AS `torneoid`,`driver`.`campo` AS `campo`,`driver`.`categoriaid` AS `categoriaid`,`driver`.`descripcion` AS `descripcion`,`driver`.`premio` AS `premio` from `driver` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_driver_jugadores`
--

/*!50001 DROP VIEW IF EXISTS `v_driver_jugadores`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_driver_jugadores` AS select `a`.`torneoid` AS `torneoid`,`a`.`campo` AS `campo`,`a`.`hoyo` AS `hoyo`,`a`.`premio` AS `premio`,`b`.`id` AS `jugadorid`,`b`.`nombre` AS `nombre`,`b`.`apellido` AS `apellido`,`b`.`club` AS `club`,`b`.`estatus` AS `estatus`,`b`.`categoriaid` AS `categoriaid`,`c`.`categoria` AS `categoria`,`b`.`grupoid` AS `grupoid` from ((`driver` `a` join `jugadores` `b` on(`a`.`categoriaid` = `b`.`categoriaid` and `a`.`torneoid` = `b`.`torneoid`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) group by `a`.`torneoid`,`a`.`campo`,`a`.`hoyo`,`a`.`premio`,`b`.`id`,`b`.`nombre`,`b`.`apellido`,`b`.`club`,`b`.`estatus`,`b`.`categoriaid`,`c`.`categoria`,`b`.`grupoid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_driverjug`
--

/*!50001 DROP VIEW IF EXISTS `v_driverjug`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_driverjug` AS select distinct `a`.`id` AS `id`,`d`.`campo` AS `campo`,`a`.`hoyo` AS `hoyo`,`a`.`premio` AS `premio`,`a`.`fecha` AS `fecha`,concat(`b`.`apellido`,' ',`b`.`nombre`) AS `jugador`,`c`.`categoria` AS `categoria`,`a`.`distancia` AS `distancia`,`b`.`id` AS `jugadorid`,`a`.`torneoid` AS `torneoid`,`p`.`descripcion` AS `descripcion` from ((((`driverjug` `a` join `jugadores` `b` on(`a`.`jugadorid` = `b`.`id`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) join `campos` `d` on(`d`.`id` = `a`.`campo`)) join `driver` `p` on(`p`.`torneoid` = `a`.`torneoid` and `p`.`campo` = `a`.`campo` and `a`.`categoriaid` = `p`.`categoriaid` and `a`.`premio` = `p`.`premio`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_driverjugp`
--

/*!50001 DROP VIEW IF EXISTS `v_driverjugp`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_driverjugp` AS select distinct `a`.`id` AS `id`,`d`.`campo` AS `campo`,`a`.`hoyo` AS `hoyo`,`a`.`premio` AS `premio`,`a`.`fecha` AS `fecha`,concat(`b`.`apellido`,' ',`b`.`nombre`) AS `jugador`,`c`.`categoria` AS `categoria`,`a`.`distancia` AS `distancia`,`b`.`id` AS `jugadorid`,`a`.`torneoid` AS `torneoid`,`p`.`descripcion` AS `descripcion` from ((((`driverjugp` `a` join `jugadores` `b` on(`a`.`jugadorid` = `b`.`id`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) join `campos` `d` on(`d`.`id` = `a`.`campo`)) join `driverp` `p` on(`p`.`torneoid` = `a`.`torneoid` and `p`.`campo` = `a`.`campo` and `a`.`categoriaid` = `p`.`categoriaid` and `a`.`premio` = `p`.`premio`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_driverp`
--

/*!50001 DROP VIEW IF EXISTS `v_driverp`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_driverp` AS select distinct `driverp`.`torneoid` AS `torneoid`,`driverp`.`campo` AS `campo`,`driverp`.`categoriaid` AS `categoriaid`,`driverp`.`descripcion` AS `descripcion`,`driverp`.`premio` AS `premio` from `driverp` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_driverunico`
--

/*!50001 DROP VIEW IF EXISTS `v_driverunico`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_driverunico` AS select `driverjug`.`torneoid` AS `torneoid`,`driverjug`.`jugadorid` AS `jugadorid`,min(`driverjug`.`distancia`) AS `mindistancia` from `driverjug` group by `driverjug`.`torneoid`,`driverjug`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_driverunicop`
--

/*!50001 DROP VIEW IF EXISTS `v_driverunicop`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_driverunicop` AS select `driverjugp`.`torneoid` AS `torneoid`,`driverjugp`.`jugadorid` AS `jugadorid`,min(`driverjugp`.`distancia`) AS `mindistancia` from `driverjugp` group by `driverjugp`.`torneoid`,`driverjugp`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_equipo_ed`
--

/*!50001 DROP VIEW IF EXISTS `v_equipo_ed`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_equipo_ed` AS select `b`.`idelimin_salidas` AS `idelimin_salidas`,`a`.`categoriaid` AS `categoriaid`,`a`.`torneoid` AS `torneoid`,`b`.`fecha` AS `fecha`,`a`.`clubid` AS `clubid`,`a`.`club` AS `club`,concat(`a`.`nombre`,' ',`a`.`apellido`) AS `jugador`,`a`.`posicion` AS `posicion`,`c`.`categoria` AS `categoria`,`b`.`dia` AS `dia`,`b`.`salida` AS `salida`,`b`.`pl_grupo` AS `pl_grupo`,`b`.`sl_grupo` AS `sl_grupo`,`b`.`matchx` AS `matchx`,`b`.`posicionp` AS `posicionp`,`b`.`posicions` AS `posicions`,`b`.`hoyo` AS `hoyo`,`b`.`resultado` AS `resultado`,`torneos`.`f_logo_jug`(`a`.`id`) AS `logojug`,`b`.`gano` AS `gano`,if(`a`.`id` = `b`.`jugidb`,2,1) AS `postabla` from ((`jugadores` `a` join `elimin_salidas_cat` `b` on(`a`.`id` = `b`.`jugida` or `a`.`id` = `b`.`jugidb`)) join `categorias` `c` on(`c`.`categoria_id` = `a`.`categoriaid`)) where 1 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_estatorneo`
--

/*!50001 DROP VIEW IF EXISTS `v_estatorneo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_estatorneo` AS select `a`.`numjugador` AS `numjugador`,`a`.`nombre` AS `nombre`,`a`.`apellido` AS `apellido`,`a`.`indexjgo` AS `indexjgo`,round(`a`.`indexjgo` * 0.8,0) AS `round((a.indexjgo*.8),0)`,`a`.`torneoid` AS `torneoid`,`b`.`categoria` AS `categoria`,`a`.`club` AS `club` from (`jugadores` `a` join `categorias` `b` on(`a`.`categoriaid` = `b`.`categoria_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_familia`
--

/*!50001 DROP VIEW IF EXISTS `v_familia`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_familia` AS select 0 AS `k`,'TODOS' AS `v` union select `dd_familia`.`k` AS `k`,`dd_familia`.`v` AS `v` from `dd_familia` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_gpsult`
--

/*!50001 DROP VIEW IF EXISTS `v_gpsult`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_gpsult` AS select `gps`.`salidaid` AS `salidaid`,max(`gps`.`id`) AS `id` from `gps` group by `gps`.`salidaid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_handicap_gogo`
--

/*!50001 DROP VIEW IF EXISTS `v_handicap_gogo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_handicap_gogo` AS select `a`.`torneoid` AS `torneoid`,`a`.`numjugador` AS `numjugador`,`a`.`categoriaid` AS `categoriaid`,`b`.`id` AS `id`,`c`.`formato` AS `formato`,if(`c`.`formato` <> 'PAREJAS',round(sum(round(`F_HDCCAMPO`(`a`.`indexjgo`,`a`.`teesalidaid`,`b`.`campo`) * `b`.`porcetajejgo` / 100,0)) / count(0),0),round(min(`F_HDCCAMPO`(`a`.`indexjgo`,`a`.`teesalidaid`,`b`.`campo`)) * `b`.`porcetajejgo` / 100 + max(`F_HDCCAMPO`(`a`.`indexjgo`,`a`.`teesalidaid`,`b`.`campo`)) * `b`.`porcetajejgo2` / 100,0)) AS `hcampo`,count(0) AS `x`,min(`F_HDCCAMPO`(`a`.`indexjgo`,`a`.`teesalidaid`,`b`.`campo`)) AS `hcampmin`,min(`F_HDCCAMPO`(`a`.`indexjgo`,`a`.`teesalidaid`,`b`.`campo`)) * `b`.`porcetajejgo` / 100 AS `hcampo1`,max(`F_HDCCAMPO`(`a`.`indexjgo`,`a`.`teesalidaid`,`b`.`campo`)) AS `hcampmax`,max(`F_HDCCAMPO`(`a`.`indexjgo`,`a`.`teesalidaid`,`b`.`campo`)) * `b`.`porcetajejgo2` / 100 AS `hcampo2`,round(`F_HDCCAMPO`(min(`a`.`indexjgo`),`a`.`teesalidaid`,`b`.`campo`) * `b`.`porcetajejgo` / 100,0) + round(`F_HDCCAMPO`(max(`a`.`indexjgo`),`a`.`teesalidaid`,`b`.`campo`) * `b`.`porcetajejgo2` / 100,0) AS `hcpfintot`,round(round(`F_HDCCAMPO`(min(`a`.`indexjgo`),`a`.`teesalidaid`,`b`.`campo`) * `b`.`porcetajejgo` / 100,0) + round(`F_HDCCAMPO`(max(`a`.`indexjgo`),`a`.`teesalidaid`,`b`.`campo`) * `b`.`porcetajejgo2` / 100,0),0) AS `hcampox` from ((`jugadores` `a` join `caljuego` `b` on(`a`.`torneoid` = `b`.`torneoid` and `a`.`categoriaid` = `b`.`categoriaid`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) where 1 group by `a`.`torneoid`,`a`.`numjugador`,`a`.`categoriaid`,`b`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_horariox`
--

/*!50001 DROP VIEW IF EXISTS `v_horariox`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_horariox` AS select `a`.`id` AS `id`,`a`.`horainicio1a` AS `horainicio1a`,`a`.`teesal` AS `teesal`,`a`.`numjug` AS `numjug`,`c`.`categoria` AS `catjugador`,`b`.`categoriaid` AS `categoriaid`,`b`.`fecha` AS `fecha`,`d`.`campo` AS `campo`,concat(`b`.`fecha`,'  ',`d`.`campo`) AS `agrupo`,`c`.`torneo_id` AS `torneoid`,left(md5(concat(`a`.`id`,'Marene01+')),6) AS `pwd` from (((`salidagrupo` `a` join `caljuego` `b` on(`a`.`caljuegoid` = `b`.`id`)) join `categorias` `c` on(`b`.`categoriaid` = `c`.`categoria_id`)) join `campos` `d` on(`b`.`campo` = `d`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_juegos`
--

/*!50001 DROP VIEW IF EXISTS `v_juegos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_juegos` AS select `driverp`.`torneoid` AS `torneoid`,`driverp`.`campo` AS `campo`,`driverp`.`premio` AS `premio`,min(`driverp`.`hoyo`) AS `numpremios`,`driverp`.`descripcion` AS `descripcion`,'presicion' AS `tipo` from `driverp` group by `driverp`.`torneoid`,`driverp`.`campo`,`driverp`.`premio`,`driverp`.`descripcion` union select `driver`.`torneoid` AS `torneoid`,`driver`.`campo` AS `campo`,`driver`.`premio` AS `premio`,min(`driver`.`hoyo`) AS `numpremios`,`driver`.`descripcion` AS `descripcion`,'distancia' AS `tipo` from `driver` group by `driver`.`torneoid`,`driver`.`campo`,`driver`.`premio`,`driver`.`descripcion` union select `oyesx`.`torneoid` AS `torneoid`,`oyesx`.`campo` AS `campo`,`oyesx`.`premio` AS `premio`,min(`oyesx`.`hoyo`) AS `numpremios`,`oyesx`.`descripcion` AS `descripcion`,'oyesx' AS `tipo` from `oyesx` group by `oyesx`.`torneoid`,`oyesx`.`campo`,`oyesx`.`premio`,`oyesx`.`descripcion` union select `putt`.`torneoid` AS `torneoid`,`putt`.`campo` AS `campo`,`putt`.`premio` AS `premio`,min(`putt`.`hoyo`) AS `numpremios`,`putt`.`descripcion` AS `descripcion`,'putt' AS `tipo` from `putt` group by `putt`.`torneoid`,`putt`.`campo`,`putt`.`premio`,`putt`.`descripcion` union select `approach`.`torneoid` AS `torneoid`,`approach`.`campo` AS `campo`,`approach`.`premio` AS `premio`,min(`approach`.`hoyo`) AS `numpremios`,`approach`.`descripcion` AS `descripcion`,'approach' AS `tipo` from `approach` group by `approach`.`torneoid`,`approach`.`campo`,`approach`.`premio`,`approach`.`descripcion` union select `a`.`torneoid` AS `torneoid`,`a`.`campo` AS `campo`,`a`.`premio` AS `premio`,`b`.`oyesnumprem` AS `numpremios`,`a`.`descripcion` AS `descripcion`,'OYES' AS `TIPO` from (`premios` `a` join `torneo` `b` on(`a`.`torneoid` = `b`.`torneo_id`)) group by `a`.`torneoid`,`a`.`premio`,`a`.`descripcion`,`a`.`campo` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_jugadores`
--

/*!50001 DROP VIEW IF EXISTS `v_jugadores`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_jugadores` AS select `jugadores`.`torneoid` AS `torneoid`,`jugadores`.`grupoid` AS `grupoid`,min(`jugadores`.`id`) AS `jugadorid`,group_concat(distinct concat(`jugadores`.`nombre`,' ',`jugadores`.`apellido`) separator ' | ') AS `pareja`,`jugadores`.`categoriaid` AS `categoriaid` from `jugadores` group by `jugadores`.`torneoid`,`jugadores`.`grupoid`,`jugadores`.`categoriaid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_jugadores_parejas`
--

/*!50001 DROP VIEW IF EXISTS `v_jugadores_parejas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_jugadores_parejas` AS select `jugadores`.`grupoid` AS `grupoid`,`jugadores`.`torneoid` AS `torneoid`,`jugadores`.`categoriaid` AS `categoriaid`,min(`jugadores`.`id`) AS `jugadorid`,max(`jugadores`.`id`) AS `jugadorid2`,round(sum(`jugadores`.`indexjgo`),1) AS `indexjgo`,round(avg(`jugadores`.`indexjgo`),1) AS `indexjgoprom`,group_concat(distinct concat(`jugadores`.`nombre`,' ',`jugadores`.`apellido`) separator ' | ') AS `pareja` from `jugadores` group by `jugadores`.`grupoid`,`jugadores`.`torneoid`,`jugadores`.`categoriaid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_jugxcat`
--

/*!50001 DROP VIEW IF EXISTS `v_jugxcat`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_jugxcat` AS select `jugadores`.`torneoid` AS `torneoid`,`jugadores`.`categoriaid` AS `categoriaid`,count(0) AS `totjug` from `jugadores` where `jugadores`.`estatus` = 'NORMAL' group by `jugadores`.`torneoid`,`jugadores`.`categoriaid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_jugxcat2`
--

/*!50001 DROP VIEW IF EXISTS `v_jugxcat2`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_jugxcat2` AS select `a`.`torneoid` AS `torneoid`,`a`.`categoriaid` AS `categoriaid`,`a`.`totjug` AS `totjug`,`b`.`categoria` AS `categoria` from (`v_jugxcat` `a` join `categorias` `b` on(`a`.`categoriaid` = `b`.`categoria_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_lista_clubs`
--

/*!50001 DROP VIEW IF EXISTS `v_lista_clubs`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_lista_clubs` AS select 0 AS `k`,'TODOS' AS `v` union select `clubs`.`id` AS `k`,`clubs`.`nombre` AS `v` from `clubs` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_lista_jug`
--

/*!50001 DROP VIEW IF EXISTS `v_lista_jug`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_lista_jug` AS select `a`.`id` AS `id`,`a`.`torneoid` AS `torneoid`,`a`.`numjugador` AS `numjugador`,`a`.`nombre` AS `nombre`,`a`.`apellido` AS `apellido`,`a`.`sexo` AS `sexo`,`c`.`nombre` AS `club`,`b`.`categoria` AS `categoria`,`a`.`grupoid` AS `grupoid`,`a`.`estatus` AS `estatus`,`a`.`categoriaid` AS `categoriaid`,`a`.`clubid` AS `clubid`,`c`.`logo` AS `logoclub`,`a`.`cd1` AS `cd1`,`a`.`cd2` AS `cd2`,`a`.`cd3` AS `cd3`,`a`.`cd4` AS `cd4`,`a`.`cd5` AS `cd5`,`a`.`cd6` AS `cd6`,`a`.`muertesubita` AS `muertesubita` from ((`jugadores` `a` join `categorias` `b` on(`a`.`categoriaid` = `b`.`categoria_id`)) join `clubs` `c` on(`a`.`clubid` = `c`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_lista_jugadores`
--

/*!50001 DROP VIEW IF EXISTS `v_lista_jugadores`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_lista_jugadores` AS select 0 AS `k`,'TODOS' AS `v`,0 AS `torneoid` union select `jugadores`.`id` AS `k`,concat(`jugadores`.`nombre`,' ',`jugadores`.`apellido`) AS `v`,`jugadores`.`torneoid` AS `torneoid` from `jugadores` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_lista_pro`
--

/*!50001 DROP VIEW IF EXISTS `v_lista_pro`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_lista_pro` AS select 0 AS `k`,'TODOS' AS `v` union select `profesionales`.`id` AS `k`,`profesionales`.`nombre` AS `v` from `profesionales` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_lista_tipos`
--

/*!50001 DROP VIEW IF EXISTS `v_lista_tipos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_lista_tipos` AS select 0 AS `k`,'TODOS' AS `v` union select `dd_tipopro`.`k` AS `k`,`dd_tipopro`.`v` AS `v` from `dd_tipopro` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_livesacor_pos`
--

/*!50001 DROP VIEW IF EXISTS `v_livesacor_pos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_livesacor_pos` AS select `tarjetas`.`categoriaid` AS `categoriaid`,`tarjetas`.`jugadorid` AS `jugadorid`,sum(`tarjetas`.`SO`) AS `so`,sum(`tarjetas`.`h1` + `tarjetas`.`h2` + `tarjetas`.`h3` + `tarjetas`.`h4` + `tarjetas`.`h5` + `tarjetas`.`h6` + `tarjetas`.`h7` + `tarjetas`.`h8` + `tarjetas`.`h9` + `tarjetas`.`h10` + `tarjetas`.`h11` + `tarjetas`.`h12` + `tarjetas`.`h13` + `tarjetas`.`h14` + `tarjetas`.`h15` + `tarjetas`.`h16` + `tarjetas`.`h17` + `tarjetas`.`h18`) AS `rdn`,count(0) AS `rondas`,max(`tarjetas`.`id`) AS `maxid` from `tarjetas` group by `tarjetas`.`categoriaid`,`tarjetas`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_matchs`
--

/*!50001 DROP VIEW IF EXISTS `v_matchs`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_matchs` AS select `a`.`id` AS `tarjetaid`,`b`.`categoriaid` AS `categoriaid`,`a`.`fecha_juego` AS `fecha_juego`,`b`.`id` AS `jugid`,`a`.`nummatch` AS `nummatch`,`b`.`grupoid` AS `grupoid`,`F_VSWHO`(`a`.`categoriaid`,`a`.`nummatch`,`b`.`grupoid`) AS `vvswho`,concat(`a`.`SO`,' / ',`a`.`dif`) AS `result` from (`jugadores` `b` left join `tarjetas` `a` on(`a`.`jugadorid` = `b`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_mejorscorejugp`
--

/*!50001 DROP VIEW IF EXISTS `v_mejorscorejugp`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_mejorscorejugp` AS select distinct `a`.`id` AS `id`,`d`.`campo` AS `campo`,`a`.`hoyo` AS `hoyo`,`a`.`premio` AS `premio`,`a`.`fecha` AS `fecha`,concat(`b`.`nombre`,' ',`b`.`apellido`) AS `jugador`,`c`.`categoria` AS `categoria`,`a`.`distancia` AS `distancia`,`b`.`id` AS `jugadorid`,`a`.`torneoid` AS `torneoid`,`p`.`descripcion` AS `descripcion`,`cl`.`logo` AS `logojug`,`a`.`categoriaid` AS `categoriaid`,`c`.`abreviatura` AS `abreviatura` from (((((`mejorscorejugp` `a` join `jugadores` `b` on(`a`.`jugadorid` = `b`.`id`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) join `campos` `d` on(`d`.`id` = `a`.`campo`)) join `mejorscorep` `p` on(`p`.`torneoid` = `a`.`torneoid` and `p`.`campo` = `a`.`campo` and `a`.`categoriaid` = `p`.`categoriaid` and `a`.`premio` = `p`.`premio`)) join `clubs` `cl` on(`b`.`clubid` = `cl`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_oyesunicas`
--

/*!50001 DROP VIEW IF EXISTS `v_oyesunicas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_oyesunicas` AS select `premiosjug`.`torneoid` AS `torneoid`,`premiosjug`.`jugadorid` AS `jugadorid`,min(`premiosjug`.`distancia`) AS `mindistancia` from `premiosjug` group by `premiosjug`.`torneoid`,`premiosjug`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_oyesunicasxoyo`
--

/*!50001 DROP VIEW IF EXISTS `v_oyesunicasxoyo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_oyesunicasxoyo` AS select `premiosjug`.`torneoid` AS `torneoid`,`premiosjug`.`jugadorid` AS `jugadorid`,`premiosjug`.`hoyo` AS `hoyo`,min(`premiosjug`.`distancia`) AS `mindistancia` from `premiosjug` group by `premiosjug`.`torneoid`,`premiosjug`.`jugadorid`,`premiosjug`.`hoyo` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_oyesx`
--

/*!50001 DROP VIEW IF EXISTS `v_oyesx`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_oyesx` AS select distinct `oyesx`.`torneoid` AS `torneoid`,`oyesx`.`campo` AS `campo`,`oyesx`.`categoriaid` AS `categoriaid`,`oyesx`.`descripcion` AS `descripcion` from `oyesx` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_oyesxjug`
--

/*!50001 DROP VIEW IF EXISTS `v_oyesxjug`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_oyesxjug` AS select distinct `a`.`id` AS `id`,`d`.`campo` AS `campo`,`a`.`hoyo` AS `hoyo`,`a`.`premio` AS `premio`,`a`.`fecha` AS `fecha`,concat(`b`.`apellido`,' ',`b`.`nombre`) AS `jugador`,`c`.`categoria` AS `categoria`,`a`.`distancia` AS `distancia`,`b`.`id` AS `jugadorid`,`a`.`torneoid` AS `torneoid`,`p`.`descripcion` AS `descripcion` from ((((`oyesxjug` `a` join `jugadores` `b` on(`a`.`jugadorid` = `b`.`id`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) join `campos` `d` on(`d`.`id` = `a`.`campo`)) join `oyesx` `p` on(`p`.`torneoid` = `a`.`torneoid` and `p`.`campo` = `a`.`campo` and `a`.`categoriaid` = `p`.`categoriaid` and `a`.`premiosjugcol` = `p`.`descripcion` and `a`.`premio` = `p`.`premio`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_parcampo`
--

/*!50001 DROP VIEW IF EXISTS `v_parcampo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_parcampo` AS select `hoyosxsalida`.`campoid` AS `campoid`,`hoyosxsalida`.`salidaid` AS `salidaid`,sum(`hoyosxsalida`.`par`) AS `par` from `hoyosxsalida` group by `hoyosxsalida`.`campoid`,`hoyosxsalida`.`salidaid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_prem_jugadores`
--

/*!50001 DROP VIEW IF EXISTS `v_prem_jugadores`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_prem_jugadores` AS select `a`.`torneoid` AS `torneoid`,`a`.`campo` AS `campo`,`a`.`hoyo` AS `hoyo`,`a`.`premio` AS `premio`,`b`.`id` AS `jugadorid`,`b`.`nombre` AS `nombre`,`b`.`apellido` AS `apellido`,`b`.`club` AS `club`,`b`.`estatus` AS `estatus`,`b`.`categoriaid` AS `categoriaid`,`c`.`categoria` AS `categoria`,`b`.`grupoid` AS `grupoid` from ((`premios` `a` join `jugadores` `b` on(`a`.`categoriaid` = `b`.`categoriaid` and `a`.`torneoid` = `b`.`torneoid`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) group by `a`.`torneoid`,`a`.`campo`,`a`.`hoyo`,`a`.`premio`,`b`.`id`,`b`.`nombre`,`b`.`apellido`,`b`.`club`,`b`.`estatus`,`b`.`categoriaid`,`c`.`categoria`,`b`.`grupoid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_prem_repet_torreon`
--

/*!50001 DROP VIEW IF EXISTS `v_prem_repet_torreon`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_prem_repet_torreon` AS select `premios`.`hoyo` AS `hoyo`,`premios`.`premio` AS `premio`,`premios`.`categoria` AS `categoria`,count(0) AS `tot`,max(`premios`.`id`) AS `id` from `premios` where `premios`.`torneoid` = 78 group by `premios`.`hoyo`,`premios`.`premio`,`premios`.`categoria` having `tot` > 1 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_premjug`
--

/*!50001 DROP VIEW IF EXISTS `v_premjug`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_premjug` AS select `a`.`id` AS `id`,`d`.`campo` AS `campo`,`a`.`hoyo` AS `hoyo`,`a`.`premio` AS `premio`,`a`.`fecha` AS `fecha`,concat(`b`.`apellido`,' ',`b`.`nombre`) AS `jugador`,`c`.`categoria` AS `categoria`,`a`.`distancia` AS `distancia`,`b`.`id` AS `jugadorid`,`a`.`torneoid` AS `torneoid`,`p`.`descripcion` AS `descripcion` from ((((`premiosjug` `a` join `jugadores` `b` on(`a`.`jugadorid` = `b`.`id`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) join `campos` `d` on(`d`.`id` = `a`.`campo`)) join `premios` `p` on(`p`.`torneoid` = `a`.`torneoid` and `p`.`campo` = `a`.`campo` and `p`.`hoyo` = `a`.`hoyo` and `a`.`fecha` = `p`.`fecha` and `a`.`categoriaid` = `p`.`categoriaid` and `a`.`fecha` = `p`.`fecha`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_putt`
--

/*!50001 DROP VIEW IF EXISTS `v_putt`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_putt` AS select distinct `putt`.`torneoid` AS `torneoid`,`putt`.`campo` AS `campo`,`putt`.`categoriaid` AS `categoriaid`,`putt`.`descripcion` AS `descripcion`,`putt`.`premio` AS `premio` from `putt` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_putt_jugadores`
--

/*!50001 DROP VIEW IF EXISTS `v_putt_jugadores`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_putt_jugadores` AS select `a`.`torneoid` AS `torneoid`,`a`.`campo` AS `campo`,`a`.`hoyo` AS `hoyo`,`a`.`premio` AS `premio`,`b`.`id` AS `jugadorid`,`b`.`nombre` AS `nombre`,`b`.`apellido` AS `apellido`,`b`.`club` AS `club`,`b`.`estatus` AS `estatus`,`b`.`categoriaid` AS `categoriaid`,`c`.`categoria` AS `categoria`,`b`.`grupoid` AS `grupoid` from ((`putt` `a` join `jugadores` `b` on(`a`.`categoriaid` = `b`.`categoriaid` and `a`.`torneoid` = `b`.`torneoid`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) group by `a`.`torneoid`,`a`.`campo`,`a`.`hoyo`,`a`.`premio`,`b`.`id`,`b`.`nombre`,`b`.`apellido`,`b`.`club`,`b`.`estatus`,`b`.`categoriaid`,`c`.`categoria`,`b`.`grupoid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_puttjug`
--

/*!50001 DROP VIEW IF EXISTS `v_puttjug`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_puttjug` AS select distinct `a`.`id` AS `id`,`d`.`campo` AS `campo`,`a`.`hoyo` AS `hoyo`,`a`.`premio` AS `premio`,`a`.`fecha` AS `fecha`,concat(`b`.`apellido`,' ',`b`.`nombre`) AS `jugador`,`c`.`categoria` AS `categoria`,`a`.`distancia` AS `distancia`,`b`.`id` AS `jugadorid`,`a`.`torneoid` AS `torneoid`,`p`.`descripcion` AS `descripcion` from ((((`puttjug` `a` join `jugadores` `b` on(`a`.`jugadorid` = `b`.`id`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) join `campos` `d` on(`d`.`id` = `a`.`campo`)) join `putt` `p` on(`p`.`torneoid` = `a`.`torneoid` and `p`.`campo` = `a`.`campo` and `a`.`categoriaid` = `p`.`categoriaid` and `a`.`premio` = `p`.`premio`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_puttunico`
--

/*!50001 DROP VIEW IF EXISTS `v_puttunico`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_puttunico` AS select `puttjug`.`torneoid` AS `torneoid`,`puttjug`.`jugadorid` AS `jugadorid`,min(`puttjug`.`distancia`) AS `mindistancia` from `puttjug` group by `puttjug`.`torneoid`,`puttjug`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_registro`
--

/*!50001 DROP VIEW IF EXISTS `v_registro`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_registro` AS select `a`.`reg_id` AS `reg_id`,`a`.`reg_id_torneo` AS `reg_id_torneo`,`a`.`reg_id_club` AS `reg_id_club`,`a`.`reg_nombre` AS `reg_nombre`,`a`.`reg_apellido` AS `reg_apellido`,`a`.`reg_genero` AS `reg_genero`,`a`.`reg_correo` AS `reg_correo`,`a`.`reg_celular` AS `reg_celular`,`a`.`reg_pais` AS `reg_pais`,`a`.`reg_estado` AS `reg_estado`,`a`.`reg_ciudad` AS `reg_ciudad`,`a`.`reg_direccion` AS `reg_direccion`,`a`.`reg_cp` AS `reg_cp`,`a`.`reg_spei` AS `reg_spei`,`a`.`reg_handicap` AS `reg_handicap`,`a`.`reg_categoria` AS `reg_categoria`,`a`.`reg_club` AS `reg_club`,`a`.`reg_mensaje` AS `reg_mensaje`,`a`.`status_pago` AS `status_pago`,`a`.`reg_cargo` AS `reg_cargo`,`a`.`reg_archivo_nombre` AS `reg_archivo_nombre`,`a`.`fecharegistro` AS `fecharegistro`,`a`.`verificado` AS `verificado`,`a`.`akron_edad` AS `akron_edad`,`a`.`akron_talla` AS `akron_talla`,`a`.`akron_talla_guante` AS `akron_talla_guante`,`a`.`akron_monto_pago` AS `akron_monto_pago`,`a`.`akron_calzado` AS `akron_calzado`,`b`.`categoria` AS `categoria`,`b`.`categoria` AS `val_categoria`,`a`.`reg_genero` AS `val_genero`,`c`.`nombre` AS `val_club`,md5(`a`.`reg_id`) AS `regidmd5` from ((`registro` `a` join `categorias` `b` on(`a`.`reg_categoria` = `b`.`categoria_id`)) left join `clubs` `c` on(`a`.`reg_id_club` = `c`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_registro_repetidos`
--

/*!50001 DROP VIEW IF EXISTS `v_registro_repetidos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_registro_repetidos` AS select `registro`.`reg_id_torneo` AS `reg_id_torneo`,`registro`.`reg_nombre` AS `reg_nombre`,`registro`.`reg_apellido` AS `reg_apellido`,`registro`.`reg_correo` AS `reg_correo`,count(0) AS `tot`,max(`registro`.`reg_id`) AS `id` from `registro` group by `registro`.`reg_id_torneo`,`registro`.`reg_nombre`,`registro`.`reg_apellido`,`registro`.`reg_correo` having `tot` > 1 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_resultar`
--

/*!50001 DROP VIEW IF EXISTS `v_resultar`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_resultar` AS select `a`.`jugadorid` AS `jugadorid`,`a`.`SO` AS `SO`,`a`.`SA` AS `SA`,`a`.`estado` AS `estado`,`a`.`fecha_juego` AS `fecha_juego`,`a`.`salidagrupoid` AS `salidagrupoid`,`a`.`categoriaid` AS `categoriaid`,`a`.`torneoid` AS `torneoid`,`b`.`horainicio1a` AS `fechasal`,`b`.`teesal` AS `teesal`,`a`.`gana` AS `gana`,`a`.`dif` AS `dif`,`a`.`totstbgross` AS `totstbgross` from ((`tarjetas` `a` join `salidagrupo` `b` on(`a`.`salidagrupoid` = `b`.`id` and `a`.`statlsc` = 1)) join `jugadores` `c` on(`a`.`jugadorid` = `c`.`id` and `c`.`estatus` in ('NORMAL','CORTE','FIRST','SECOND','OUT'))) order by `a`.`fecha_juego` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_sal_jug`
--

/*!50001 DROP VIEW IF EXISTS `v_sal_jug`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_sal_jug` AS select `a`.`id` AS `tarjetaid`,`b`.`salidatorneoid` AS `salidatorneoid`,`a`.`campoid` AS `campoid`,`a`.`jugadorid` AS `jugadorid`,`a`.`tee_salida` AS `tee_salida`,`a`.`salidagrupoid` AS `salidagrupoid`,`a`.`slope` AS `slope`,`a`.`rating` AS `rating`,`b`.`horainicio1a` AS `horainicio1a`,`b`.`horainicio2a` AS `horainicio2a`,`b`.`teesal` AS `teesal`,`c`.`numjugador` AS `numjugador`,`c`.`nombre` AS `nombre`,`c`.`apellido` AS `apellido`,`c`.`fechahandicap` AS `fechahandicap`,`c`.`sexo` AS `sexo`,`c`.`hcpindex` AS `hcpindex`,`c`.`teesalidaid` AS `teesalidaid`,`c`.`correo` AS `correo`,`c`.`club` AS `club`,`c`.`tipoinsc` AS `tipoinsc`,`c`.`tipoinsc2` AS `tipoinsc2`,`c`.`indexjgo` AS `indexjgo`,`c`.`salida` AS `colortee`,`d`.`tee` AS `tee`,`a`.`categoriaid` AS `categoriaid`,`c`.`grupoid` AS `grupoid`,`c`.`torneoid` AS `torneoid`,`c`.`estatus` AS `jugestatus`,`a`.`fecha_juego` AS `fecha_juego`,`b`.`caljuegoid` AS `caljuegoid`,`a`.`orden` AS `orden`,`e`.`abr` AS `abr`,`a`.`nummatch` AS `nummatch`,`F_TORNEOSAX`(`c`.`id`,`c`.`torneoid`) AS `acumsa`,`F_TORNEO_STBGROSS`(`c`.`id`,`c`.`torneoid`) AS `acumstbgross`,`F_TORNEOSOX`(`c`.`id`,`c`.`torneoid`) AS `acumso`,`F_HDCCAMPO`(`c`.`indexjgo`,`c`.`teesalidaid`,`j`.`campo`) AS `hadicap`,`F_HDCCAMPONETO`(`c`.`indexjgo`,`c`.`teesalidaid`,`j`.`campo`,`cc`.`porcentaje`) AS `handicapneto`,`F_GETVENTAJAJUG`(`F_HDCCAMPONETO`(`c`.`indexjgo`,`c`.`teesalidaid`,`j`.`campo`,`cc`.`porcentaje`),`j`.`campo`,`c`.`teesalidaid`) AS `ventajasjug`,`a`.`arso` AS `arso`,`a`.`arsa` AS `arsa`,`a`.`arsap` AS `arsap`,`F_HDCCAMPONETO`(`c`.`indexjgo`,`cc`.`salida`,`j`.`campo`,`cc`.`porcentaje`) AS `hdccamponeto`,`cc`.`formato` AS `formato`,`j`.`porcetajejgo` AS `porcetajejgo`,`e`.`logo` AS `logo`,`cc`.`sistema` AS `sistema`,`d`.`id` AS `salidaid`,`cc`.`gross` AS `gross`,`a`.`hcampo` AS `hcampo`,`a`.`ventajas` AS `ventajastar`,`a`.`tagid` AS `tagid` from ((((((`tarjetas` `a` join `salidagrupo` `b` on(`a`.`salidagrupoid` = `b`.`id`)) join `caljuego` `j` on(`b`.`caljuegoid` = `j`.`id`)) join `jugadores` `c` on(`a`.`jugadorid` = `c`.`id`)) join `categorias` `cc` on(`a`.`categoriaid` = `cc`.`categoria_id`)) join `salidas` `d` on(`d`.`id` = `c`.`teesalidaid`)) left join `clubs` `e` on(`c`.`clubid` = `e`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_sal_jug_par`
--

/*!50001 DROP VIEW IF EXISTS `v_sal_jug_par`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_sal_jug_par` AS select `a`.`id` AS `tarjetaid`,`b`.`salidatorneoid` AS `salidatorneoid`,`a`.`campoid` AS `id_campo`,`a`.`campoid` AS `campoid`,`a`.`jugadorid` AS `jugadorid`,`a`.`tee_salida` AS `tee_salida`,`a`.`salidagrupoid` AS `salidagrupoid`,`a`.`slope` AS `slope`,`a`.`rating` AS `rating`,`b`.`horainicio1a` AS `horainicio1a`,`b`.`horainicio2a` AS `horainicio2a`,`b`.`teesal` AS `teesal`,`c`.`numjugador` AS `numjugador`,concat('<b>',`c`.`grupoid`,'</b>   ',`c`.`nombre`,' ',`c`.`apellido`,'<br>       ',`f`.`nombre`,' ',`f`.`apellido`) AS `nombre`,`c`.`fechahandicap` AS `fechahandicap`,`c`.`sexo` AS `sexo`,`c`.`hcpindex` AS `hcpindex`,`c`.`teesalidaid` AS `teesalidaid`,`c`.`correo` AS `correo`,`c`.`club` AS `club`,`f`.`club` AS `club2`,`c`.`tipoinsc` AS `tipoinsc`,`c`.`tipoinsc2` AS `tipoinsc2`,`c`.`indexjgo` AS `indexjgo`,`c`.`salida` AS `colortee`,`d`.`tee` AS `tee`,`a`.`categoriaid` AS `categoriaid`,`c`.`grupoid` AS `grupoid`,`c`.`torneoid` AS `torneoid`,`c`.`estatus` AS `jugestatus`,`a`.`fecha_juego` AS `fecha_juego`,`b`.`caljuegoid` AS `caljuegoid`,`a`.`orden` AS `orden`,`e`.`abr` AS `abr`,`v`.`indexjgoprom` AS `indexjgoprom`,`g`.`abr` AS `abr2`,`f`.`id` AS `jugid2`,`c`.`id` AS `jugid1`,`a`.`nummatch` AS `nummatch`,`e`.`logo` AS `logo`,`g`.`logo` AS `logo2`,`F_TORNEOSAX`(`c`.`id`,`c`.`torneoid`) AS `acumsa`,`cj`.`estilojuego` AS `sistema`,`a`.`arso` AS `arso`,`a`.`arsa` AS `arsa`,`a`.`arsap` AS `arsap`,`a`.`SA` AS `sa`,`a`.`SO` AS `so` from ((((((((`tarjetas` `a` join `salidagrupo` `b` on(`a`.`salidagrupoid` = `b`.`id`)) join `jugadores` `c` on(`a`.`jugadorid` = `c`.`id`)) join `v_jugadores_parejas` `v` on(`a`.`jugadorid` = `v`.`jugadorid`)) join `jugadores` `f` on(`c`.`grupoid` = `f`.`grupoid` and `f`.`torneoid` = `c`.`torneoid` and `c`.`categoriaid` = `f`.`categoriaid` and `c`.`id` <> `f`.`id`)) join `salidas` `d` on(`d`.`id` = `a`.`tee_salida`)) left join `clubs` `e` on(`c`.`club` = `e`.`nombre`)) left join `clubs` `g` on(`f`.`club` = `g`.`nombre`)) join `caljuego` `cj` on(`b`.`caljuegoid` = `cj`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_salidas_h1`
--

/*!50001 DROP VIEW IF EXISTS `v_salidas_h1`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_salidas_h1` AS select `salidagrupo`.`id` AS `id`,`salidagrupo`.`salidatorneoid` AS `salidatorneoid`,`salidagrupo`.`horainicio1a` AS `horainicio1a`,`salidagrupo`.`horafin1a` AS `horafin1a`,`salidagrupo`.`horainicio2a` AS `horainicio2a`,`salidagrupo`.`horafin2a` AS `horafin2a`,`salidagrupo`.`categoriaid` AS `categoriaid`,`salidagrupo`.`teesal` AS `teesal`,`salidagrupo`.`caljuegoid` AS `caljuegoid` from `salidagrupo` where `salidagrupo`.`teesal` in ('h1am','h1pm') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_salidas_h10`
--

/*!50001 DROP VIEW IF EXISTS `v_salidas_h10`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_salidas_h10` AS select `salidagrupo`.`id` AS `id`,`salidagrupo`.`salidatorneoid` AS `salidatorneoid`,`salidagrupo`.`horainicio1a` AS `horainicio1a`,`salidagrupo`.`horafin1a` AS `horafin1a`,`salidagrupo`.`horainicio2a` AS `horainicio2a`,`salidagrupo`.`horafin2a` AS `horafin2a`,`salidagrupo`.`categoriaid` AS `categoriaid`,`salidagrupo`.`teesal` AS `teesal`,`salidagrupo`.`caljuegoid` AS `caljuegoid` from `salidagrupo` where `salidagrupo`.`teesal` in ('h10am','h10pm') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_salidas_ls`
--

/*!50001 DROP VIEW IF EXISTS `v_salidas_ls`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_salidas_ls` AS select `a`.`torneoid` AS `torneoid`,`a`.`fecha` AS `fecha`,`b`.`campo` AS `campo`,`b`.`id` AS `campoid`,left(md5(concat(`a`.`fecha`,'Marene10+')),6) AS `pwd`,`c`.`sistema` AS `sistema` from ((`caljuego` `a` join `campos` `b` on(`a`.`campo` = `b`.`id`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) where `a`.`estatus` = 2 and `a`.`campo` > 0 group by `a`.`torneoid`,`a`.`fecha`,`b`.`campo`,`b`.`id`,`c`.`sistema` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_salidas_tarj`
--

/*!50001 DROP VIEW IF EXISTS `v_salidas_tarj`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_salidas_tarj` AS select `t`.`id` AS `id`,`t`.`salidagrupoid` AS `salidagrupoid`,`a`.`horainicio1a` AS `horainicio1a`,`a`.`teesal` AS `teesal`,`a`.`numjug` AS `numjug`,`c`.`categoria` AS `categoria`,`b`.`fecha` AS `fecha`,`d`.`campo` AS `campo`,concat(' fecha ',`b`.`fecha`,' Categoria ',`c`.`categoria`) AS `agrupo`,`j`.`numjugador` AS `numjugador`,`j`.`nombre` AS `nombre`,`j`.`apellido` AS `apellido`,`j`.`torneoid` AS `torneoid`,`j`.`id` AS `jugadorid`,`t`.`orden` AS `orden`,`g`.`nombre` AS `club`,`j`.`clubid` AS `clubid`,`cc`.`categoria` AS `categojug`,`t`.`SO` AS `so`,`t`.`SA` AS `sa`,`b`.`categoriaid` AS `categoriaid`,`cc`.`formato` AS `formato`,`a`.`caljuegoid` AS `caljuegoid`,`b`.`estilojuego` AS `estilojuego`,`b`.`porcetajejgo` AS `porcetajejgo`,`c`.`sistema` AS `sistema`,`j`.`estatus` AS `estatus`,if(`c`.`formato` = 'PAREJAS',`F_PAREJA`(`t`.`jugadorid`),concat(`j`.`nombre`,' ',`j`.`apellido`)) AS `jugador`,if(`t`.`h1` > 0,1,0) + if(`t`.`h2` > 0,1,0) + if(`t`.`h3` > 0,1,0) + if(`t`.`h4` > 0,1,0) + if(`t`.`h5` > 0,1,0) + if(`t`.`h6` > 0,1,0) + if(`t`.`h7` > 0,1,0) + if(`t`.`h8` > 0,1,0) + if(`t`.`h9` > 0,1,0) + if(`t`.`h10` > 0,1,0) + if(`t`.`h11` > 0,1,0) + if(`t`.`h12` > 0,1,0) + if(`t`.`h13` > 0,1,0) + if(`t`.`h14` > 0,1,0) + if(`t`.`h15` > 0,1,0) + if(`t`.`h16` > 0,1,0) + if(`t`.`h17` > 0,1,0) + if(`t`.`h18` > 0,1,0) AS `avance` from (((((((`salidagrupo` `a` join `caljuego` `b` on(`a`.`caljuegoid` = `b`.`id` and `b`.`estatus` = 2)) join `categorias` `c` on(`b`.`categoriaid` = `c`.`categoria_id`)) join `campos` `d` on(`b`.`campo` = `d`.`id`)) join `tarjetas` `t` on(`t`.`salidagrupoid` = `a`.`id`)) join `jugadores` `j` on(`j`.`id` = `t`.`jugadorid`)) left join `clubs` `g` on(`j`.`clubid` = `g`.`id`)) join `categorias` `cc` on(`cc`.`categoria_id` = `j`.`categoriaid`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_salidas_tarj1`
--

/*!50001 DROP VIEW IF EXISTS `v_salidas_tarj1`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_salidas_tarj1` AS select `t`.`id` AS `id`,`t`.`salidagrupoid` AS `salidagrupoid`,`a`.`horainicio1a` AS `horainicio1a`,`a`.`teesal` AS `teesal`,`a`.`numjug` AS `numjug`,`b`.`categoria` AS `categoria`,`c`.`fecha` AS `fecha`,`d`.`campo` AS `campo`,concat(' fecha ',`c`.`fecha`,' Categoria ',`b`.`categoria`) AS `agrupo`,`j`.`numjugador` AS `numjugador`,`j`.`nombre` AS `nombre`,`j`.`apellido` AS `apellido`,if(`b`.`formato` = 'PAREJAS',`f_pareja`(`t`.`jugadorid`),concat(`j`.`nombre`,' ',`j`.`apellido`)) AS `jugador`,`j`.`torneoid` AS `torneoid`,`t`.`orden` AS `orden`,`g`.`nombre` AS `club`,`j`.`clubid` AS `clubid`,`b`.`categoria` AS `categojug`,`t`.`SO` AS `so`,`t`.`SA` AS `sa`,`j`.`id` AS `jugadorid`,`b`.`formato` AS `formato`,`a`.`caljuegoid` AS `caljuegoid`,`a`.`categoriaid` AS `categoriaid`,`t`.`tagid` AS `tagid` from ((((((`salidagrupo` `a` join `categorias` `b` on(`a`.`categoriaid` = `b`.`categoria_id`)) join `caljuego` `c` on(`c`.`id` = `a`.`caljuegoid` and `c`.`estatus` < 2)) join `campos` `d` on(`c`.`campo` = `d`.`id`)) join `tarjetas` `t` on(`t`.`salidagrupoid` = `a`.`id`)) join `jugadores` `j` on(`j`.`id` = `t`.`jugadorid`)) left join `clubs` `g` on(`j`.`clubid` = `g`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_salidas_tl`
--

/*!50001 DROP VIEW IF EXISTS `v_salidas_tl`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_salidas_tl` AS select `b`.`torneoid` AS `torneoid`,`b`.`fecha` AS `fecha`,`a`.`caljuegoid` AS `caljuegoid`,`c`.`categoria` AS `categoria` from ((`salidagrupo` `a` join `caljuego` `b` on(`a`.`caljuegoid` = `b`.`id`)) join `categorias` `c` on(`c`.`categoria_id` = `b`.`categoriaid`)) group by `b`.`torneoid`,`b`.`fecha`,`a`.`caljuegoid`,`c`.`categoria` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_salidas_x`
--

/*!50001 DROP VIEW IF EXISTS `v_salidas_x`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_salidas_x` AS select distinct `a`.`id` AS `id`,`a`.`fecha` AS `fecha`,`a`.`categoria` AS `categoria`,`b`.`categoria_id` AS `categoria_id`,`a`.`torneoid` AS `torneoid`,`a`.`estatus` AS `estatus`,`b`.`sistema` AS `sistema`,`b`.`formato` AS `formato`,`a`.`estilojuego` AS `estilo`,`a`.`ordenSal` AS `ordenSal` from ((`caljuego` `a` join `categorias` `b` on(`a`.`categoriaid` = `b`.`categoria_id` and `a`.`campo` <> 0)) join `v_caljgo_salgpo` `x` on(`x`.`caljuegoid` = `a`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_skin_mingross`
--

/*!50001 DROP VIEW IF EXISTS `v_skin_mingross`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_skin_mingross` AS select `b`.`Skin_grupo_id` AS `Skin_grupo_id`,`a`.`id_campo` AS `campoid`,`a`.`torneoid` AS `torneoid`,`a`.`fecha_juego` AS `fecha_juego`,min(`a`.`h1`) AS `h1`,min(`a`.`h2`) AS `h2`,min(`a`.`h3`) AS `h3`,min(`a`.`h4`) AS `h4`,min(`a`.`h5`) AS `h5`,min(`a`.`h6`) AS `h6`,min(`a`.`h7`) AS `h7`,min(`a`.`h8`) AS `h8`,min(`a`.`h9`) AS `h9`,min(`a`.`h10`) AS `h10`,min(`a`.`h11`) AS `h11`,min(`a`.`h12`) AS `h12`,min(`a`.`h13`) AS `h13`,min(`a`.`h14`) AS `h14`,min(`a`.`h15`) AS `h15`,min(`a`.`h16`) AS `h16`,min(`a`.`h17`) AS `h17`,min(`a`.`h18`) AS `h18` from (`Skeen_tarjetas` `a` join `categorias` `b` on(`b`.`categoria_id` = `a`.`categoriaid`)) where 1 group by `b`.`Skin_grupo_id`,`a`.`id_campo`,`a`.`torneoid`,`a`.`fecha_juego` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_skin_minneto`
--

/*!50001 DROP VIEW IF EXISTS `v_skin_minneto`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_skin_minneto` AS select `b`.`Skin_grupo_id` AS `Skin_grupo_id`,`a`.`id_campo` AS `campoid`,`a`.`torneoid` AS `torneoid`,`a`.`fecha_juego` AS `fecha_juego`,min(`a`.`h1_a`) AS `h1`,min(`a`.`h2_a`) AS `h2`,min(`a`.`h3_a`) AS `h3`,min(`a`.`h4_a`) AS `h4`,min(`a`.`h5_a`) AS `h5`,min(`a`.`h6_a`) AS `h6`,min(`a`.`h7_a`) AS `h7`,min(`a`.`h8_a`) AS `h8`,min(`a`.`h9_a`) AS `h9`,min(`a`.`h10_a`) AS `h10`,min(`a`.`h11_a`) AS `h11`,min(`a`.`h12_a`) AS `h12`,min(`a`.`h13_a`) AS `h13`,min(`a`.`h14_a`) AS `h14`,min(`a`.`h15_a`) AS `h15`,min(`a`.`h16_a`) AS `h16`,min(`a`.`h17_a`) AS `h17`,min(`a`.`h18_a`) AS `h18` from ((`Skeen_tarjetas` `a` join `categorias` `b` on(`b`.`categoria_id` = `a`.`categoriaid`)) join `jugadores` `j` on(`a`.`jugadorid` = `j`.`id` and left(`j`.`estatus`,1) = 'N')) where 1 group by `b`.`Skin_grupo_id`,`a`.`id_campo`,`a`.`torneoid`,`a`.`fecha_juego` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_subgrupos`
--

/*!50001 DROP VIEW IF EXISTS `v_subgrupos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_subgrupos` AS select `jugadores`.`categoriaid` AS `categoriaid`,json_object('grupo',`jugadores`.`subgrupo`,'jug',count(0)) AS `jug` from `jugadores` where 1 and left(`jugadores`.`estatus`,1) = 'N' group by `jugadores`.`categoriaid`,`jugadores`.`subgrupo` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_sum_golforo`
--

/*!50001 DROP VIEW IF EXISTS `v_sum_golforo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_sum_golforo` AS select `a`.`jugadorid` AS `jugadorid`,`a`.`torneoid` AS `torneoid`,sum(if(`a`.`SO` > 0,`a`.`SO` - `a`.`go`,0)) AS `go`,sum(`a`.`SO`) AS `sa`,sum(if(`a`.`SO` > 0,`a`.`go`,0)) AS `mgo` from (`tarjetas` `a` join `jugadores` `b` on(`a`.`jugadorid` = `b`.`id`)) where `b`.`estatus` = 'NORMAL' group by `a`.`jugadorid`,`a`.`torneoid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_sumaptosrr`
--

/*!50001 DROP VIEW IF EXISTS `v_sumaptosrr`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_sumaptosrr` AS select `tarjetas`.`jugadorid` AS `jugadorid`,sum(if(abs(`tarjetas`.`SO`) = 18 and abs(`tarjetas`.`dif`) = 18,1,if(abs(`tarjetas`.`SO`) > 0 and `tarjetas`.`gana` > 0,3,0))) AS `ptos`,count(0) AS `juegos`,sum(`tarjetas`.`hog`) AS `hog` from `tarjetas` group by `tarjetas`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_sumrr`
--

/*!50001 DROP VIEW IF EXISTS `v_sumrr`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_sumrr` AS select `a`.`jugadorid` AS `jugadorid`,`a`.`categoriaid` AS `categoriaid`,sum(`a`.`gana`) AS `totptos`,sum(if(`a`.`gana` = 1,`a`.`dif`,-`a`.`dif`)) AS `diferencial` from (`tarjetas` `a` join `caljuego` `b` on(`a`.`categoriaid` = `b`.`categoriaid` and `a`.`fecha_juego` = `b`.`fecha`)) group by `a`.`jugadorid`,`a`.`categoriaid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_sumsa`
--

/*!50001 DROP VIEW IF EXISTS `v_sumsa`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_sumsa` AS select `a`.`jugadorid` AS `jugadorid`,`a`.`categoriaid` AS `categoriaid`,sum(if(`a`.`h1` > 0,cast(`a`.`h1_a` as signed),0) + if(`a`.`h2` > 0,cast(`a`.`h2_a` as signed),0) + if(`a`.`h3` > 0,cast(`a`.`h3_a` as signed),0) + if(`a`.`h4` > 0,cast(`a`.`h4_a` as signed),0) + if(`a`.`h5` > 0,cast(`a`.`h5_a` as signed),0) + if(`a`.`h6` > 0,cast(`a`.`h6_a` as signed),0) + if(`a`.`h7` > 0,cast(`a`.`h7_a` as signed),0) + if(`a`.`h8` > 0,cast(`a`.`h8_a` as signed),0) + if(`a`.`h9` > 0,cast(`a`.`h9_a` as signed),0) + if(`a`.`h10` > 0,cast(`a`.`h10_a` as signed),0) + if(`a`.`h11` > 0,cast(`a`.`h11_a` as signed),0) + if(`a`.`h12` > 0,cast(`a`.`h12_a` as signed),0) + if(`a`.`h13` > 0,cast(`a`.`h13_a` as signed),0) + if(`a`.`h14` > 0,cast(`a`.`h14_a` as signed),0) + if(`a`.`h15` > 0,cast(`a`.`h15_a` as signed),0) + if(`a`.`h16` > 0,cast(`a`.`h16_a` as signed),0) + if(`a`.`h17` > 0,cast(`a`.`h17_a` as signed),0) + if(`a`.`h18` > 0,cast(`a`.`h18_a` as signed),0)) AS `sumsa` from `tarjetas` `a` where 1 group by `a`.`jugadorid`,`a`.`categoriaid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_sumsa_normal`
--

/*!50001 DROP VIEW IF EXISTS `v_sumsa_normal`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_sumsa_normal` AS select `a`.`jugadorid` AS `jugadorid`,`a`.`categoriaid` AS `categoriaid`,sum(`a`.`SA`) AS `sa`,sum(`a`.`SO`) AS `so`,sum(`a`.`totstbgross`) AS `totstbgross` from (`tarjetas` `a` join `jugadores` `b` on(`a`.`jugadorid` = `b`.`id`)) where `b`.`estatus` = 'NORMAL' group by `a`.`jugadorid`,`a`.`categoriaid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_sumsarr`
--

/*!50001 DROP VIEW IF EXISTS `v_sumsarr`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_sumsarr` AS select `a`.`jugadorid` AS `jugadorid`,`a`.`categoriaid` AS `categoriaid`,sum(if(`a`.`h1` > 0,cast(`a`.`h1_a` as signed),0) + if(`a`.`h2` > 0,cast(`a`.`h2_a` as signed),0) + if(`a`.`h3` > 0,cast(`a`.`h3_a` as signed),0) + if(`a`.`h4` > 0,cast(`a`.`h4_a` as signed),0) + if(`a`.`h5` > 0,cast(`a`.`h5_a` as signed),0) + if(`a`.`h6` > 0,cast(`a`.`h6_a` as signed),0) + if(`a`.`h7` > 0,cast(`a`.`h7_a` as signed),0) + if(`a`.`h8` > 0,cast(`a`.`h8_a` as signed),0) + if(`a`.`h9` > 0,cast(`a`.`h9_a` as signed),0) + if(`a`.`h10` > 0,cast(`a`.`h10_a` as signed),0) + if(`a`.`h11` > 0,cast(`a`.`h11_a` as signed),0) + if(`a`.`h12` > 0,cast(`a`.`h12_a` as signed),0) + if(`a`.`h13` > 0,cast(`a`.`h13_a` as signed),0) + if(`a`.`h14` > 0,cast(`a`.`h14_a` as signed),0) + if(`a`.`h15` > 0,cast(`a`.`h15_a` as signed),0) + if(`a`.`h16` > 0,cast(`a`.`h16_a` as signed),0) + if(`a`.`h17` > 0,cast(`a`.`h17_a` as signed),0) + if(`a`.`h18` > 0,cast(`a`.`h18_a` as signed),0)) AS `sumsa`,sum(if(`a`.`h1` > 0,1,0) + if(`a`.`h2` > 0,1,0) + if(`a`.`h3` > 0,1,0) + if(`a`.`h4` > 0,1,0) + if(`a`.`h5` > 0,1,0) + if(`a`.`h6` > 0,1,0) + if(`a`.`h7` > 0,1,0) + if(`a`.`h8` > 0,1,0) + if(`a`.`h9` > 0,1,0) + if(`a`.`h10` > 0,1,0) + if(`a`.`h11` > 0,1,0) + if(`a`.`h12` > 0,1,0) + if(`a`.`h13` > 0,1,0) + if(`a`.`h14` > 0,1,0) + if(`a`.`h15` > 0,1,0) + if(`a`.`h16` > 0,1,0) + if(`a`.`h17` > 0,1,0) + if(`a`.`h18` > 0,1,0)) AS `avance` from `tarjetas` `a` where `a`.`statlsc` = 0 group by `a`.`jugadorid`,`a`.`categoriaid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_sumsarr2`
--

/*!50001 DROP VIEW IF EXISTS `v_sumsarr2`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_sumsarr2` AS select `a`.`jugadorid` AS `jugadorid`,`a`.`categoriaid` AS `categoriaid`,sum(if(`a`.`h1` > 0,cast(`a`.`h1_a` as signed),0) + if(`a`.`h2` > 0,cast(`a`.`h2_a` as signed),0) + if(`a`.`h3` > 0,cast(`a`.`h3_a` as signed),0) + if(`a`.`h4` > 0,cast(`a`.`h4_a` as signed),0) + if(`a`.`h5` > 0,cast(`a`.`h5_a` as signed),0) + if(`a`.`h6` > 0,cast(`a`.`h6_a` as signed),0) + if(`a`.`h7` > 0,cast(`a`.`h7_a` as signed),0) + if(`a`.`h8` > 0,cast(`a`.`h8_a` as signed),0) + if(`a`.`h9` > 0,cast(`a`.`h9_a` as signed),0) + if(`a`.`h10` > 0,cast(`a`.`h10_a` as signed),0) + if(`a`.`h11` > 0,cast(`a`.`h11_a` as signed),0) + if(`a`.`h12` > 0,cast(`a`.`h12_a` as signed),0) + if(`a`.`h13` > 0,cast(`a`.`h13_a` as signed),0) + if(`a`.`h14` > 0,cast(`a`.`h14_a` as signed),0) + if(`a`.`h15` > 0,cast(`a`.`h15_a` as signed),0) + if(`a`.`h16` > 0,cast(`a`.`h16_a` as signed),0) + if(`a`.`h17` > 0,cast(`a`.`h17_a` as signed),0) + if(`a`.`h18` > 0,cast(`a`.`h18_a` as signed),0)) AS `sumsa`,sum(if(`a`.`h1` > 0,1,0) + if(`a`.`h2` > 0,1,0) + if(`a`.`h3` > 0,1,0) + if(`a`.`h4` > 0,1,0) + if(`a`.`h5` > 0,1,0) + if(`a`.`h6` > 0,1,0) + if(`a`.`h7` > 0,1,0) + if(`a`.`h8` > 0,1,0) + if(`a`.`h9` > 0,1,0) + if(`a`.`h10` > 0,1,0) + if(`a`.`h11` > 0,1,0) + if(`a`.`h12` > 0,1,0) + if(`a`.`h13` > 0,1,0) + if(`a`.`h14` > 0,1,0) + if(`a`.`h15` > 0,1,0) + if(`a`.`h16` > 0,1,0) + if(`a`.`h17` > 0,1,0) + if(`a`.`h18` > 0,1,0)) AS `avance` from `tarjetas` `a` where 1 group by `a`.`jugadorid`,`a`.`categoriaid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_sumstbl_gross`
--

/*!50001 DROP VIEW IF EXISTS `v_sumstbl_gross`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`itinnova`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_sumstbl_gross` AS select `tarjetas`.`jugadorid` AS `jugadorid`,`tarjetas`.`categoriaid` AS `categoriaid`,sum(`tarjetas`.`totstbgross`) AS `totstbgross` from `tarjetas` where 1 and `tarjetas`.`statlsc` = 1 group by `tarjetas`.`jugadorid`,`tarjetas`.`categoriaid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_sumtarjeta`
--

/*!50001 DROP VIEW IF EXISTS `v_sumtarjeta`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_sumtarjeta` AS select `a`.`jugadorid` AS `jugadorid`,sum(`a`.`SO`) AS `so`,sum(`a`.`SA`) AS `sa`,sum(`a`.`totstbgross`) AS `totstbgross`,max(`b`.`horainicio1a`) AS `hinicio`,max(`b`.`id`) AS `salidaid` from (`tarjetas` `a` join `salidagrupo` `b` on(`a`.`salidagrupoid` = `b`.`id`)) group by `a`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_ult_tarjeta`
--

/*!50001 DROP VIEW IF EXISTS `v_ult_tarjeta`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_ult_tarjeta` AS select `tarjetas`.`torneoid` AS `torneoid`,`tarjetas`.`jugadorid` AS `jugadorid`,max(`tarjetas`.`id`) AS `tarjetaid` from `tarjetas` where `tarjetas`.`estatus` <> 'X' and `tarjetas`.`statlsc` = 1 group by `tarjetas`.`torneoid`,`tarjetas`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_ult_tarjeta0`
--

/*!50001 DROP VIEW IF EXISTS `v_ult_tarjeta0`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_ult_tarjeta0` AS select `tarjetas`.`torneoid` AS `torneoid`,`tarjetas`.`jugadorid` AS `jugadorid`,max(`tarjetas`.`id`) AS `tarjetaid`,count(0) AS `ronda` from `tarjetas` group by `tarjetas`.`torneoid`,`tarjetas`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_ult_tarjeta_sin0`
--

/*!50001 DROP VIEW IF EXISTS `v_ult_tarjeta_sin0`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_ult_tarjeta_sin0` AS select `tarjetas`.`torneoid` AS `torneoid`,`tarjetas`.`jugadorid` AS `jugadorid`,max(`tarjetas`.`id`) AS `tarjetaid` from `tarjetas` where `tarjetas`.`estatus` <> 'X' and `tarjetas`.`statlsc` = 1 group by `tarjetas`.`torneoid`,`tarjetas`.`jugadorid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_v_oyesxjug`
--

/*!50001 DROP VIEW IF EXISTS `v_v_oyesxjug`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tomas.obeso`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_v_oyesxjug` AS select `a`.`id` AS `id`,`d`.`campo` AS `campo`,`a`.`hoyo` AS `hoyo`,`a`.`premio` AS `premio`,`a`.`fecha` AS `fecha`,concat(`b`.`apellido`,' ',`b`.`nombre`) AS `jugador`,`c`.`categoria` AS `categoria`,`a`.`distancia` AS `distancia`,`b`.`id` AS `jugadorid`,`a`.`torneoid` AS `torneoid`,`p`.`descripcion` AS `descripcion` from ((((`oyesxjug` `a` join `jugadores` `b` on(`a`.`jugadorid` = `b`.`id`)) join `categorias` `c` on(`a`.`categoriaid` = `c`.`categoria_id`)) join `campos` `d` on(`d`.`id` = `a`.`campo`)) join `oyesx` `p` on(`p`.`torneoid` = `a`.`torneoid` and `p`.`campo` = `a`.`campo` and `a`.`categoriaid` = `p`.`categoriaid` and `a`.`premiosjugcol` = `p`.`descripcion`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-09 11:42:16
